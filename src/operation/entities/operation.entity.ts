import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Compte } from 'src/compte/entities/compte.entity';
import { Ticket } from 'src/ticket/entities/ticket.entity';
import { Service } from 'src/service/entities/service.entity';
import { Decade } from 'src/decade/entities/decade.entity';
import { Session } from 'src/session/entities/session.entity';

export type OperationDocument = HydratedDocument<Operation>;

export enum TypeOperation {
  RECHARGE = 'RECHARGE',
  UTILISATION = 'UTILISATION',
  TRANSFERT = 'TRANSFERT',
}

@Schema({ timestamps: true })
export class Operation {
  _id: string;

  @Prop({ type: String, required: true, enum: Object.values(TypeOperation) })
  type: TypeOperation;

  @Prop({ type: Number, required: true, min: 0 })
  montant: number;

  // Compte source (pour RECHARGE, UTILISATION, TRANSFERT)
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Compte.name, required: true, })
  compte: Compte;

  // Compte destinataire (uniquement pour TRANSFERT)
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Compte.name})
  compteDestinataire?: Compte;

  // Ticket (pour UTILISATION)
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Ticket.name })
  ticket?: Ticket;

   @Prop({type:Object})
  ticketSnapshot:Partial<Ticket>

  // Service (pour UTILISATION)
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Service.name })
  service?: Service;

  @Prop({type:Object})
  serviceSnapshot:Partial<Service>

  // Decade (pour UTILISATION de restaurant)
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Decade.name })
  decade?: Decade;

  // Agent de contrôle (obligatoire pour UTILISATION et RECHARGE, optionnel pour TRANSFERT)
  @Prop({ type: String })
  agentControle?: string;

  // Session académique (obligatoire, définie automatiquement à la session active)
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Session.name, required: true})
  session: Session;

  // Note ou description
  @Prop({ type: String })
  note?: string;

  createdAt: Date;
  updatedAt: Date;
}

export const OperationSchema = SchemaFactory.createForClass(Operation);
