import { BadRequestException, HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateOperationDto } from './dto/create-operation.dto';
import { UpdateOperationDto } from './dto/update-operation.dto';
import { Operation, TypeOperation } from './entities/operation.entity';
import { CompteService } from 'src/compte/compte.service';
import { TicketService } from 'src/ticket/services/ticket.service';
import { ServiceService } from 'src/service/service.service';
import { DecadeService } from 'src/decade/decade.service';
import { SoldevendeurService } from 'src/soldevendeur/soldevendeur.service';
import { TypeService } from 'src/service/dto/create-service.dto';
import { Etudiant, EtudiantDocument } from 'src/etudiant/entities/etudiant.entity';
import { SessionService } from 'src/session/session.service';
import { EventsGateway } from 'src/events/events.gateway';
import { User, UserDocument } from 'src/user/entities/user.entity';

@Injectable()
export class OperationService {
  constructor(
    @InjectModel(Operation.name, 'ecampus') private operationModel: Model<Operation>,
    @InjectModel(Etudiant.name, 'etudiant') private etudiantModel: Model<EtudiantDocument>,
    @InjectModel(User.name, 'users') private userModel: Model<UserDocument>,
    private compteService: CompteService,
    private ticketService: TicketService,
    private serviceService: ServiceService,
    private decadeService: DecadeService,
    private soldevendeurService: SoldevendeurService,
    private sessionService: SessionService,
    private eventsService:EventsGateway
  ) {}

  async create(createOperationDto: CreateOperationDto): Promise<Operation> {
    try {
      // Récupérer la session active
      const sessionActive = await this.sessionService.getActiveSession();
      
      // Ajouter la session au DTO
      createOperationDto.session = sessionActive._id;

      // Vérifier le compte source
      const compte = await this.compteService.findOne(createOperationDto.compte);
      if (!compte || compte.is_actif === false) {
        throw new BadRequestException('Compte non trouvé ou bloqué');
      }

      // Traiter selon le type d'opération
      switch (createOperationDto.type) {
        case TypeOperation.RECHARGE:
          return await this.traiterRecharge(createOperationDto);
        
        case TypeOperation.UTILISATION:
          return await this.traiterUtilisation(createOperationDto);
        
        case TypeOperation.TRANSFERT:
          return await this.traiterTransfert(createOperationDto);
        
        default:
          throw new BadRequestException('Type d\'opération non supporté');
      }
    } catch (error) {
      throw new HttpException(error.message, error.statusCode || 500);
    }
  }

  /**
   * Traite une opération de recharge
   * Champs requis: agentControle, compte, montant
   */
  private async traiterRecharge(dto: CreateOperationDto): Promise<Operation> {
    // Vérifier l'agent de contrôle (obligatoire pour RECHARGE)
    if (!dto.agentControle) {
      throw new BadRequestException('Agent de contrôle requis pour une recharge');
    }

    // Vérifier que le montant est fourni
    if (!dto.montant || dto.montant <= 0) {
      throw new BadRequestException('Le montant de la recharge doit être positif');
    }

    // Ajouter le montant au solde du compte
    await this.compteService.ajouterSolde(dto.compte, dto.montant);

    // Ajouter le montant au solde du vendeur
    await this.soldevendeurService.ajouterSolde(dto.agentControle, dto.montant);

    // Créer l'opération
    const operation = new this.operationModel(dto);
    return await operation.save();
  }

  /**
   * Traite une opération d'utilisation de service
   * Champs requis: agentControle, compte, ticket, service
   * Le montant est calculé automatiquement à partir du prix du ticket
   */
  private async traiterUtilisation(dto: CreateOperationDto): Promise<Operation> {
    // Vérifier l'agent de contrôle (obligatoire pour UTILISATION)
    if (!dto.agentControle) {
      throw new BadRequestException('Agent de contrôle requis pour une utilisation');
    }
  
    // Vérifier le ticket (obligatoire pour UTILISATION)
    if (!dto.ticket) {
      throw new BadRequestException('Ticket requis pour une utilisation');
    }
    const ticket = await this.ticketService.findOne(dto.ticket);
    if (!ticket || !ticket.active) {
      throw new BadRequestException('Ticket non trouvé ou inactif');
    }

    // Vérifier le service (obligatoire pour UTILISATION)
    if (!dto.service) {
      throw new BadRequestException('Service requis pour une utilisation');
    }
    const service = await this.serviceService.findOne(dto.service);
    if (!service || !service.active) {
      throw new BadRequestException('Service non trouvé ou inactif');
    }

    // Si c'est un restaurant, récupérer la décade active
    if (service.typeService === TypeService.RESTAURANT) {
      const decade = await this.decadeService.findActiveDecade();
      dto.decade = decade._id;
    }

    // Calculer le montant à partir du prix du ticket
    const prixTicket = Number(ticket.prix);
    dto.montant = prixTicket;

    // Vérifier que le compte a suffisamment de solde
    const soldeActuel = await this.compteService.getSolde(dto.compte);
    if (soldeActuel < prixTicket) {
      throw new BadRequestException(`Solde insuffisant. Disponible: ${soldeActuel}, Requis: ${prixTicket}`);
    }

    // Retirer le prix du ticket du solde du compte
    await this.compteService.retirerSolde(dto.compte, prixTicket);

    const serviceSnapshot = {nom:service.nom,_id:service._id,prixRepreneur:service.prixRepreneur,TypeService:service.typeService};
    const ticketSnapshot = {_id:ticket._id,nom: ticket.nom,prix:ticket.prix}

    // Créer l'opération 
    const operation = new this.operationModel({...dto,serviceSnapshot,ticketSnapshot});
    const op = await (await operation.save()).populate({ path: 'compte', populate: { path: 'etudiant', model: this.etudiantModel } });
    if(op){
      this.eventsService.envoyerCreationOperation(op);
    }
    return op;
  }

  /**
   * Traite une opération de transfert entre comptes
   * Champs requis: compte, compteDestinataire, montant
   * L'agentControle n'est pas obligatoire pour les transferts
   */
  private async traiterTransfert(dto: CreateOperationDto): Promise<Operation> {
    // Vérifier le compte destinataire (obligatoire pour TRANSFERT)
    if (!dto.compteDestinataire) {
      throw new BadRequestException('Compte destinataire requis pour un transfert');
    }
    const compteDestinataire = await this.compteService.findOne(dto.compteDestinataire);
    if (!compteDestinataire || compteDestinataire.is_actif === false) {
      throw new BadRequestException('Compte destinataire non trouvé ou bloqué');
    }

    // Vérifier que les comptes sont différents
    if (dto.compte === dto.compteDestinataire) {
      throw new BadRequestException('Impossible de transférer vers le même compte');
    }

    // Vérifier que le montant est fourni et positif
    if (!dto.montant || dto.montant <= 0) {
      throw new BadRequestException('Le montant du transfert doit être positif');
    }

    // Vérifier que le compte source a suffisamment de solde
    const soldeActuel = await this.compteService.getSolde(dto.compte);
    if (soldeActuel < dto.montant) {
      throw new BadRequestException(`Solde insuffisant. Disponible: ${soldeActuel}, Requis: ${dto.montant}`);
    }

    // Retirer du compte source
    await this.compteService.retirerSolde(dto.compte, dto.montant);

    // Ajouter au compte destinataire
    await this.compteService.ajouterSolde(dto.compteDestinataire, dto.montant);

    // Créer l'opération
    const operation = new this.operationModel(dto);
    return await operation.save();
  }

  async findAll(): Promise<Operation[]> {
    try {
      const sessionActive = await this.sessionService.getActiveSession();
      return await this.operationModel
        .find()
        .where('session', sessionActive._id)
        .populate({ path: 'compte', populate: { path: 'etudiant', model: this.etudiantModel } })
        .populate({ path: 'compteDestinataire', populate: { path: 'etudiant', model: this.etudiantModel } })
        .populate({ path: 'agentControle', model: this.userModel })
        .sort({ createdAt: -1 })
        .exec();
    } catch (error) {
      throw new HttpException(error.message, 500);
    }
  }

  async findByType(type: TypeOperation): Promise<Operation[]> {
    try {
      const sessionActive = await this.sessionService.getActiveSession();
      return await this.operationModel
        .find({ type })
        .where('session', sessionActive._id)
        .populate({ path: 'compte', populate: { path: 'etudiant', model: this.etudiantModel } })
        .populate({ path: 'compteDestinataire', populate: { path: 'etudiant', model: this.etudiantModel } })
        .populate({ path: 'agentControle', model: this.userModel })
        .sort({ createdAt: -1 })
        .exec();
    } catch (error) {
      throw new HttpException(error.message, 500);
    }
  }

  async findByPeriod(startDate: string, endDate: string): Promise<Operation[]> {
    try {
      const sessionActive = await this.sessionService.getActiveSession();
      return await this.operationModel
        .find({ createdAt: { $gte: startDate, $lte: endDate } })
        .where('session', sessionActive._id)
        .populate({ path: 'compte', populate: { path: 'etudiant', model: this.etudiantModel } })
        .populate({ path: 'compteDestinataire', populate: { path: 'etudiant', model: this.etudiantModel } })
        .populate({ path: 'agentControle', model: this.userModel })
        .sort({ createdAt: -1 })
        .exec();
    } catch (error) {
      throw new HttpException(error.message, 500);
    }
  }

  async findOne(id: string): Promise<Operation> {
    try {
      const operation = await this.operationModel
        .findById(id)
        .populate({ path: 'compte', populate: { path: 'etudiant', model: this.etudiantModel } })
        .populate({ path: 'compteDestinataire', populate: { path: 'etudiant', model: this.etudiantModel } })
        .populate({ path: 'agentControle', model: this.userModel })
        .exec();
      if (!operation) {
        throw new NotFoundException('Opération non trouvée');
      }
      return operation;
    } catch (error) {
      throw new HttpException(error.message, error.statusCode || 500);
    }
  }

  async findByCompte(compteId: string): Promise<Operation[]> {
    try {
      const sessionActive = await this.sessionService.getActiveSession();
      return await this.operationModel
        .find({ 
          $or: [{ compte: compteId }, { compteDestinataire: compteId }],
          session: sessionActive._id
        } as any)
        .populate({ path: 'compte', populate: { path: 'etudiant', model: this.etudiantModel } })
        .populate({ path: 'compteDestinataire', populate: { path: 'etudiant', model: this.etudiantModel } })
        .populate({ path: 'agentControle', model: this.userModel })
        .sort({ createdAt: -1 })
        .exec();
    } catch (error) {
      throw new HttpException(error.message, 500);
    }
  }

  async findLatestByCompte(compteId: string): Promise<Operation[]> {
    try {
      const sessionActive = await this.sessionService.getActiveSession();
      return await this.operationModel
        .find({ 
          $or: [{ compte: compteId }, { compteDestinataire: compteId }],
          session: sessionActive._id
        } as any)
        .populate({ path: 'compte', populate: { path: 'etudiant', model: this.etudiantModel } })
        .populate({ path: 'compteDestinataire', populate: { path: 'etudiant', model: this.etudiantModel } })
        .populate({ path: 'agentControle', model: this.userModel })        
        .sort({ createdAt: -1 })
        .limit(10)
        .exec();
    } catch (error) {
      throw new HttpException(error.message, 500);
    }
  }

  async findByAgent(agentId: string): Promise<Operation[]> {
    try {
      const sessionActive = await this.sessionService.getActiveSession();
      return await this.operationModel
        .find({ agentControle: agentId, session: sessionActive._id } as any)
        .populate({ path: 'compte', populate: { path: 'etudiant', model: this.etudiantModel } })
        .populate({ path: 'compteDestinataire', populate: { path: 'etudiant', model: this.etudiantModel } })
        .populate({ path: 'agentControle', model: this.userModel })
        .sort({ createdAt: -1 })
        .exec();
    } catch (error) {
      throw new HttpException(error.message, 500);
    }
  }

  async findByTicket(ticketId: string): Promise<Operation[]> {
    try {
      const sessionActive = await this.sessionService.getActiveSession();
      return await this.operationModel
        .find({ ticket: ticketId, session: sessionActive._id } as any)
        .populate({ path: 'compte', populate: { path: 'etudiant', model: this.etudiantModel } })
        .populate({ path: 'compteDestinataire', populate: { path: 'etudiant', model: this.etudiantModel } })
        .populate({ path: 'agentControle', model: this.userModel })
        .sort({ createdAt: -1 })
        .exec();
    } catch (error) {
      throw new HttpException(error.message, 500);
    }
  }

  async findByService(serviceId: string): Promise<Operation[]> {
    try {
      const sessionActive = await this.sessionService.getActiveSession();
      return await this.operationModel
        .find({ service: serviceId, session: sessionActive._id } as any)
        .populate({ path: 'compte', populate: { path: 'etudiant', model: this.etudiantModel } })
        .populate({ path: 'compteDestinataire', populate: { path: 'etudiant', model: this.etudiantModel } })
        .populate({ path: 'agentControle', model: this.userModel })
        .sort({ createdAt: -1 })
        .exec();
    } catch (error) {
      throw new HttpException(error.message, 500);
    }
  }

  async findByDecade(decadeId: string): Promise<Operation[]> {
    try {
      const sessionActive = await this.sessionService.getActiveSession();
      return await this.operationModel
        .find({ decade: decadeId, session: sessionActive._id } as any)
        .populate({ path: 'compte', populate: { path: 'etudiant', model: this.etudiantModel } })
        .populate({ path: 'compteDestinataire', populate: { path: 'etudiant', model: this.etudiantModel } })
        .populate({ path: 'agentControle', model: this.userModel })
        .sort({ createdAt: -1 })
        .exec();
    } catch (error) {
      throw new HttpException(error.message, 500);
    }
  }

  async findByDecadeAndService(decadeId: string, serviceId: string): Promise<Operation[]>{
     try {
      const sessionActive = await this.sessionService.getActiveSession();
      return await this.operationModel
        .find({ decade: decadeId, service: serviceId, session: sessionActive._id } as any)
        .populate({ path: 'compte', populate: { path: 'etudiant', model: this.etudiantModel } })
        .populate({ path: 'compteDestinataire', populate: { path: 'etudiant', model: this.etudiantModel } })
        .populate({ path: 'agentControle', model: this.userModel })
        .sort({ createdAt: -1 })
        .exec();
    } catch (error) {
      throw new HttpException(error.message, 500);
    }
  }

  /**
   * Vérifie si un ticket a été consommé aujourd'hui par un compte
   */
  async hasConsumedToday(compteId: string, ticketId: string): Promise<{ hasConsumed: boolean; operation?: Operation }> {
    try {
      const sessionActive = await this.sessionService.getActiveSession();
      
      // Calculer le début et la fin de la journée
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      // Chercher une opération d'UTILISATION pour ce compte et ce ticket aujourd'hui dans la session active
      const operation = await this.operationModel
        .findOne({
          type: TypeOperation.UTILISATION,
          compte: compteId,
          ticket: ticketId,
          session: sessionActive._id,
          createdAt: { $gte: startOfDay, $lte: endOfDay }
        } as any)
        .populate({ path: 'compte', populate: { path: 'etudiant', model: this.etudiantModel } })
        .exec();

      return {
        hasConsumed: !!operation,
        operation: operation || undefined
      };
    } catch (error) {
      throw new HttpException(error.message, 500);
    }
  }

  /**
   * Récupère les opérations d'une session spécifique
   */
  async findBySession(sessionId: string): Promise<Operation[]> {
    try {
      return await this.operationModel
        .find()
        .where('session', sessionId)
        .populate({ path: 'compte', populate: { path: 'etudiant', model: this.etudiantModel } })
        .populate({ path: 'compteDestinataire', populate: { path: 'etudiant', model: this.etudiantModel } })
        .populate({ path: 'agentControle', model: this.userModel })
        .sort({ createdAt: -1 })
        .exec();
    } catch (error) {
      throw new HttpException(error.message, 500);
    }
  }

  async update(id: string, updateOperationDto: UpdateOperationDto): Promise<Operation> {
    try {
      const operation = await this.operationModel.findByIdAndUpdate(id, updateOperationDto, { new: true }).exec();
      if (!operation) {
        throw new NotFoundException('Opération non trouvée');
      }
      this.eventsService.envoyerUpdateOperation(operation)
      return operation;
    } catch (error) {
      throw new HttpException(error.message, error.statusCode || 500);
    }
  }

  async remove(id: string): Promise<Operation> {
    try {
      const operation = await this.operationModel.findByIdAndDelete(id).exec();
      if (!operation) {
        throw new NotFoundException('Opération non trouvée');
      }
      this.eventsService.envoyerDeleteOperation(operation._id)
      return operation;
    } catch (error) {
      throw new HttpException(error.message, error.statusCode || 500);
    }
  }

  /**
   * Supprime toutes les opérations d'un compte
   */
  async deleteMany(compteId: string): Promise<any> {
    try {
      return await this.operationModel.deleteMany({ 
        $or: [{ compte: compteId }, { compteDestinataire: compteId }] 
      } as any).exec();
    } catch (error) {
      throw new HttpException(error.message, 500);
    }
  }
}
