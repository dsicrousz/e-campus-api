import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";
import { Session } from "src/session/entities/session.entity";

export type HistoriqueSoldeDocument = HydratedDocument<HistoriqueSolde>;

export enum TYPE_ACTEUR {
  VENDEUR = "VENDEUR",
  RECOUVREUR = "RECOUVREUR",
  CAISSIER_PRINCIPAL = "CAISSIER_PRINCIPAL",
  AGENT_COMPTABLE = "AGENT_COMPTABLE"
}

export enum TYPE_MOUVEMENT {
  CREDIT = "CREDIT",
  DEBIT = "DEBIT"
}

@Schema({ timestamps: true })
export class HistoriqueSolde {
  _id: string;

  @Prop({ type: String, required: true })
  acteur_id: string;

  @Prop({ type: String, required: true, enum: TYPE_ACTEUR })
  type_acteur: TYPE_ACTEUR;

  @Prop({ type: String, required: true, enum: TYPE_MOUVEMENT })
  type_mouvement: TYPE_MOUVEMENT;

  @Prop({ type: Number, required: true })
  montant: number;

  @Prop({ type: Number, required: true })
  solde_avant: number;

  @Prop({ type: Number, required: true })
  solde_apres: number;

  @Prop({ type: String })
  source_acteur_id: string;

  @Prop({ type: String, enum: TYPE_ACTEUR })
  source_type_acteur: TYPE_ACTEUR;

  @Prop({ type: String })
  destination_acteur_id: string;

  @Prop({ type: String, enum: TYPE_ACTEUR })
  destination_type_acteur: TYPE_ACTEUR;

  @Prop({ type: String })
  reference_versement_id: string;

  @Prop({ type: String })
  description: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Session.name, autopopulate: { select: ['annee', '_id'] } })
  session: Session;
}

export const HistoriqueSoldeSchema = SchemaFactory.createForClass(HistoriqueSolde);

HistoriqueSoldeSchema.index({ acteur_id: 1, type_acteur: 1 });
HistoriqueSoldeSchema.index({ session: 1 });
HistoriqueSoldeSchema.index({ createdAt: -1 });
