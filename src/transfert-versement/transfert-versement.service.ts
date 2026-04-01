import { BadRequestException, HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { nanoid } from 'nanoid';
import { TransfertVersement, TransfertVersementDocument, ETAT_TRANSFERT, TYPE_TRANSFERT } from './entities/transfert-versement.entity';
import { CreateTransfertVersementDto, TransfertVendeurRecouvreurDto, TransfertRecouvreurCaissierPrincipalDto, TransfertCaissierPrincipalAgentComptableDto } from './dto/create-transfert-versement.dto';
import { SoldevendeurService } from 'src/soldevendeur/soldevendeur.service';
import { SoldeRecouvreurService } from 'src/solde-recouvreur/solde-recouvreur.service';
import { SoldeCaissierPrincipalService } from 'src/solde-caissier-principal/solde-caissier-principal.service';
import { SessionService } from 'src/session/session.service';
import { TYPE_ACTEUR } from 'src/historique-solde/entities/historique-solde.entity';
import { HistoriqueSoldeService } from 'src/historique-solde/historique-solde.service';
import { TYPE_MOUVEMENT } from 'src/historique-solde/entities/historique-solde.entity';

@Injectable()
export class TransfertVersementService {
  constructor(
    @InjectModel(TransfertVersement.name, 'ecampus') private transfertModel: Model<TransfertVersementDocument>,
    private readonly soldevendeurService: SoldevendeurService,
    private readonly soldeRecouvreurService: SoldeRecouvreurService,
    private readonly soldeCaissierPrincipalService: SoldeCaissierPrincipalService,
    private readonly sessionService: SessionService,
    private readonly historiqueSoldeService: HistoriqueSoldeService
  ) {}

  async createTransfertVendeurRecouvreur(dto: TransfertVendeurRecouvreurDto): Promise<TransfertVersement> {
    try {
      const sessionActive = await this.sessionService.getActiveSession();
      const transaction_id = nanoid();

      const soldeVendeur = await this.soldevendeurService.getSolde(dto.vendeur_id);
      if (soldeVendeur < dto.montant) {
        throw new BadRequestException(`Solde vendeur insuffisant. Disponible: ${soldeVendeur}, Demandé: ${dto.montant}`);
      }

      const transfert = new this.transfertModel({
        transaction_id,
        type_transfert: TYPE_TRANSFERT.VENDEUR_VERS_RECOUVREUR,
        source_acteur_id: dto.vendeur_id,
        source_type_acteur: TYPE_ACTEUR.VENDEUR,
        destination_acteur_id: dto.recouvreur_id,
        destination_type_acteur: TYPE_ACTEUR.RECOUVREUR,
        montant: dto.montant,
        etat: ETAT_TRANSFERT.EN_ATTENTE,
        note: dto.note,
        session: sessionActive._id
      });

      return await transfert.save();
    } catch (error) {
      throw new HttpException(error.message, error.statusCode || 500);
    }
  }

  async createTransfertRecouvreurCaissierPrincipal(dto: TransfertRecouvreurCaissierPrincipalDto): Promise<TransfertVersement> {
    try {
      const sessionActive = await this.sessionService.getActiveSession();
      const transaction_id = nanoid();

      const soldeRecouvreur = await this.soldeRecouvreurService.getSolde(dto.recouvreur_id);
      if (soldeRecouvreur < dto.montant) {
        throw new BadRequestException(`Solde recouvreur insuffisant. Disponible: ${soldeRecouvreur}, Demandé: ${dto.montant}`);
      }

      const transfert = new this.transfertModel({
        transaction_id,
        type_transfert: TYPE_TRANSFERT.RECOUVREUR_VERS_CAISSIER_PRINCIPAL,
        source_acteur_id: dto.recouvreur_id,
        source_type_acteur: TYPE_ACTEUR.RECOUVREUR,
        destination_acteur_id: dto.caissier_principal_id,
        destination_type_acteur: TYPE_ACTEUR.CAISSIER_PRINCIPAL,
        montant: dto.montant,
        etat: ETAT_TRANSFERT.EN_ATTENTE,
        note: dto.note,
        session: sessionActive._id
      });

      return await transfert.save();
    } catch (error) {
      throw new HttpException(error.message, error.statusCode || 500);
    }
  }

  async createTransfertCaissierPrincipalAgentComptable(dto: TransfertCaissierPrincipalAgentComptableDto): Promise<TransfertVersement> {
    try {
      const sessionActive = await this.sessionService.getActiveSession();
      const transaction_id = nanoid();

      const soldeCaissierPrincipal = await this.soldeCaissierPrincipalService.getSolde(dto.caissier_principal_id);
      if (soldeCaissierPrincipal < dto.montant) {
        throw new BadRequestException(`Solde caissier principal insuffisant. Disponible: ${soldeCaissierPrincipal}, Demandé: ${dto.montant}`);
      }

      const transfert = new this.transfertModel({
        transaction_id,
        type_transfert: TYPE_TRANSFERT.CAISSIER_PRINCIPAL_VERS_AGENT_COMPTABLE,
        source_acteur_id: dto.caissier_principal_id,
        source_type_acteur: TYPE_ACTEUR.CAISSIER_PRINCIPAL,
        destination_acteur_id: dto.agent_comptable_id,
        destination_type_acteur: TYPE_ACTEUR.AGENT_COMPTABLE,
        montant: dto.montant,
        etat: ETAT_TRANSFERT.EN_ATTENTE,
        note: dto.note,
        session: sessionActive._id
      });

      return await transfert.save();
    } catch (error) {
      throw new HttpException(error.message, error.statusCode || 500);
    }
  }

  async validerTransfert(id: string, validateur_id: string): Promise<TransfertVersement> {
    try {
      const transfert = await this.transfertModel.findById(id);
      if (!transfert) {
        throw new BadRequestException('Transfert non trouvé');
      }

      if (transfert.etat !== ETAT_TRANSFERT.EN_ATTENTE) {
        throw new BadRequestException(`Ce transfert ne peut pas être validé. État actuel: ${transfert.etat}`);
      }

      switch (transfert.type_transfert) {
        case TYPE_TRANSFERT.VENDEUR_VERS_RECOUVREUR:
          await this.executeTransfertVendeurRecouvreur(transfert);
          break;
        case TYPE_TRANSFERT.RECOUVREUR_VERS_CAISSIER_PRINCIPAL:
          await this.executeTransfertRecouvreurCaissierPrincipal(transfert);
          break;
        case TYPE_TRANSFERT.CAISSIER_PRINCIPAL_VERS_AGENT_COMPTABLE:
          await this.executeTransfertCaissierPrincipalAgentComptable(transfert);
          break;
      }

      return await this.transfertModel.findByIdAndUpdate(
        id,
        {
          etat: ETAT_TRANSFERT.VALIDE,
          date_validation: new Date(),
          validateur_id
        },
        { new: true }
      );
    } catch (error) {
      throw new HttpException(error.message, error.statusCode || 500);
    }
  }

  private async executeTransfertVendeurRecouvreur(transfert: TransfertVersement): Promise<void> {
    const soldeVendeurAvant = await this.soldevendeurService.getSolde(transfert.source_acteur_id);
    if (soldeVendeurAvant < transfert.montant) {
      throw new BadRequestException(`Solde vendeur insuffisant. Disponible: ${soldeVendeurAvant}, Demandé: ${transfert.montant}`);
    }

    await this.soldevendeurService.retirerSolde(transfert.source_acteur_id, transfert.montant);
    
    await this.historiqueSoldeService.create({
      acteur_id: transfert.source_acteur_id,
      type_acteur: TYPE_ACTEUR.VENDEUR,
      type_mouvement: TYPE_MOUVEMENT.DEBIT,
      montant: transfert.montant,
      solde_avant: soldeVendeurAvant,
      solde_apres: soldeVendeurAvant - transfert.montant,
      destination_acteur_id: transfert.destination_acteur_id,
      destination_type_acteur: TYPE_ACTEUR.RECOUVREUR,
      reference_versement_id: transfert._id.toString(),
      description: `Transfert vers recouvreur - ${transfert.transaction_id}`
    });

    await this.soldeRecouvreurService.ajouterSolde(
      transfert.destination_acteur_id,
      transfert.montant,
      transfert.source_acteur_id,
      TYPE_ACTEUR.VENDEUR,
      transfert._id.toString(),
      `Réception de vendeur - ${transfert.transaction_id}`
    );
  }

  private async executeTransfertRecouvreurCaissierPrincipal(transfert: TransfertVersement): Promise<void> {
    await this.soldeRecouvreurService.retirerSolde(
      transfert.source_acteur_id,
      transfert.montant,
      transfert.destination_acteur_id,
      TYPE_ACTEUR.CAISSIER_PRINCIPAL,
      transfert._id.toString(),
      `Transfert vers caissier principal - ${transfert.transaction_id}`
    );

    await this.soldeCaissierPrincipalService.ajouterSolde(
      transfert.destination_acteur_id,
      transfert.montant,
      transfert.source_acteur_id,
      TYPE_ACTEUR.RECOUVREUR,
      transfert._id.toString(),
      `Réception de recouvreur - ${transfert.transaction_id}`
    );
  }

  private async executeTransfertCaissierPrincipalAgentComptable(transfert: TransfertVersement): Promise<void> {
    await this.soldeCaissierPrincipalService.retirerSolde(
      transfert.source_acteur_id,
      transfert.montant,
      transfert.destination_acteur_id,
      TYPE_ACTEUR.AGENT_COMPTABLE,
      transfert._id.toString(),
      `Transfert vers agent comptable - ${transfert.transaction_id}`
    );

    await this.historiqueSoldeService.create({
      acteur_id: transfert.destination_acteur_id,
      type_acteur: TYPE_ACTEUR.AGENT_COMPTABLE,
      type_mouvement: TYPE_MOUVEMENT.CREDIT,
      montant: transfert.montant,
      solde_avant: 0,
      solde_apres: transfert.montant,
      source_acteur_id: transfert.source_acteur_id,
      source_type_acteur: TYPE_ACTEUR.CAISSIER_PRINCIPAL,
      reference_versement_id: transfert._id.toString(),
      description: `Réception de caissier principal - ${transfert.transaction_id}`
    });
  }

  async refuserTransfert(id: string, validateur_id: string): Promise<TransfertVersement> {
    try {
      const transfert = await this.transfertModel.findById(id);
      if (!transfert) {
        throw new BadRequestException('Transfert non trouvé');
      }

      if (transfert.etat !== ETAT_TRANSFERT.EN_ATTENTE) {
        throw new BadRequestException(`Ce transfert ne peut pas être refusé. État actuel: ${transfert.etat}`);
      }

      return await this.transfertModel.findByIdAndUpdate(
        id,
        {
          etat: ETAT_TRANSFERT.REFUSE,
          date_validation: new Date(),
          validateur_id
        },
        { new: true }
      );
    } catch (error) {
      throw new HttpException(error.message, error.statusCode || 500);
    }
  }

  async findAll(): Promise<TransfertVersement[]> {
    try {
      const sessionActive = await this.sessionService.getActiveSession();
      return await this.transfertModel
        .find()
        .where('session', sessionActive._id)
        .sort({ createdAt: -1 })
        .exec();
    } catch (error) {
      throw new HttpException(error.message, error.statusCode || 500);
    }
  }

  async findOne(id: string): Promise<TransfertVersement> {
    try {
      return await this.transfertModel.findById(id).exec();
    } catch (error) {
      throw new HttpException(error.message, error.statusCode || 500);
    }
  }

  async findByEtat(etat: ETAT_TRANSFERT): Promise<TransfertVersement[]> {
    try {
      const sessionActive = await this.sessionService.getActiveSession();
      return await this.transfertModel
        .find({ etat })
        .where('session', sessionActive._id)
        .sort({ createdAt: -1 })
        .exec();
    } catch (error) {
      throw new HttpException(error.message, error.statusCode || 500);
    }
  }

  async findByActeur(acteur_id: string, type_acteur: TYPE_ACTEUR): Promise<TransfertVersement[]> {
    try {
      const sessionActive = await this.sessionService.getActiveSession();
      return await this.transfertModel
        .find({
          $or: [
            { source_acteur_id: acteur_id, source_type_acteur: type_acteur },
            { destination_acteur_id: acteur_id, destination_type_acteur: type_acteur }
          ]
        })
        .where('session', sessionActive._id)
        .sort({ createdAt: -1 })
        .exec();
    } catch (error) {
      throw new HttpException(error.message, error.statusCode || 500);
    }
  }

  async findByTypeTransfert(type_transfert: TYPE_TRANSFERT): Promise<TransfertVersement[]> {
    try {
      const sessionActive = await this.sessionService.getActiveSession();
      return await this.transfertModel
        .find({ type_transfert })
        .where('session', sessionActive._id)
        .sort({ createdAt: -1 })
        .exec();
    } catch (error) {
      throw new HttpException(error.message, error.statusCode || 500);
    }
  }

  async findBySession(sessionId: string): Promise<TransfertVersement[]> {
    try {
      return await this.transfertModel
        .find()
        .where('session', sessionId)
        .sort({ createdAt: -1 })
        .exec();
    } catch (error) {
      throw new HttpException(error.message, error.statusCode || 500);
    }
  }
}
