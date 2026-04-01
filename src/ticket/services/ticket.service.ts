import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Ticket, TicketDocument } from '../entities/ticket.entity';
import { CreateTicketDto } from '../dto/create-ticket.dto';
import { UpdateTicketDto } from '../dto/update-ticket.dto';
import { CompteService } from '../../compte/compte.service';
import { ServiceService } from '../../service/service.service';
import { DecadeService } from '../../decade/decade.service';
@Injectable()
export class TicketService {
  constructor(
    @InjectModel(Ticket.name, 'ecampus')
    private ticketModel: Model<TicketDocument>,
   private compteService: CompteService,
   private serviceService: ServiceService,
   private decadeService: DecadeService
  ) {}

  async create(createDto: CreateTicketDto): Promise<Ticket> {
    const ticket = new this.ticketModel({
      nom: createDto.nom,
      description: createDto.description,
      prix: createDto.prix,
      active: createDto.active,
    });

    return ticket.save();
  }

  async findAll(): Promise<Ticket[]> {
    return this.ticketModel.find().exec();
  }

  async findAllActive(): Promise<Ticket[]> {
    return this.ticketModel.find({ active: true }).exec();
  }

  async findOne(id: string): Promise<Ticket> {
    const ticket = await this.ticketModel.findById(id).exec();
    if (!ticket) {
      throw new NotFoundException(`Ticket ${id} non trouvé`);
    }
    return ticket;
  }

  async update(id: string, updateDto: UpdateTicketDto): Promise<Ticket> {
    const ticket = await this.ticketModel
      .findByIdAndUpdate(id, updateDto, { new: true })
      .exec();
    if (!ticket) {
      throw new NotFoundException(`Ticket ${id} non trouvé`);
    }
    return ticket;
  }

  async remove(id: string): Promise<void> {
    const result = await this.ticketModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Ticket ${id} non trouvé`);
    }
  }

  async toggleActive(id: string): Promise<Ticket> {
    const ticket = await this.ticketModel.findById(id).exec();
    if (!ticket) {
      throw new NotFoundException(`Ticket ${id} non trouvé`);
    }
    ticket.active = !ticket.active;
    return ticket.save();
  }


  /**
   * Vérifie si un étudiant peut utiliser un ticket
   */
  async peutUtiliserTicket(
    compteCode: string,
    ticketId: string,
  ): Promise<{
    peutUtiliser: boolean;
    raison?: string;
    solde?: number;
    prix?: number;
  }> {
    const compte = await this.compteService.findOneByCode(compteCode);
    if (!compte) {
      return { peutUtiliser: false, raison: 'Compte introuvable' };
    }
    if (!compte.is_actif) {
      return { peutUtiliser: false, raison: 'Compte inactif' };
    }

    const ticket = await this.ticketModel.findById(ticketId).lean();
    if (!ticket) {
      return { peutUtiliser: false, raison: 'Ticket introuvable' };
    }
    if (!ticket.active) {
      return { peutUtiliser: false, raison: 'Ticket inactif' };
    }

    const soldeActuel = await this.compteService.getSolde(compte._id.toString());
    const prixTicket = Number(ticket.prix);
    
    if (soldeActuel < prixTicket) {
      return {
        peutUtiliser: false,
        raison: 'Solde insuffisant',
        solde: soldeActuel,
        prix: prixTicket,
      };
    }

    return {
      peutUtiliser: true,
      solde: soldeActuel,
      prix: prixTicket,
    };
  }
}
