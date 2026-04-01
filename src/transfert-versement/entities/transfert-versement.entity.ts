import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";
import { Session } from "src/session/entities/session.entity";
import { TYPE_ACTEUR } from "src/historique-solde/entities/historique-solde.entity";

export type TransfertVersementDocument = HydratedDocument<TransfertVersement>;

export enum ETAT_TRANSFERT {
  EN_ATTENTE = "EN_ATTENTE",
  VALIDE = "VALIDE",
  REFUSE = "REFUSE",
  ANNULE = "ANNULE"
}

export enum TYPE_TRANSFERT {
  VENDEUR_VERS_RECOUVREUR = "VENDEUR_VERS_RECOUVREUR",
  RECOUVREUR_VERS_CAISSIER_PRINCIPAL = "RECOUVREUR_VERS_CAISSIER_PRINCIPAL",
  CAISSIER_PRINCIPAL_VERS_AGENT_COMPTABLE = "CAISSIER_PRINCIPAL_VERS_AGENT_COMPTABLE"
}

@Schema({ timestamps: true })
export class TransfertVersement {
  _id: string;

  @Prop({ type: String, required: true, unique: true })
  transaction_id: string;

  @Prop({ type: String, required: true, enum: TYPE_TRANSFERT })
  type_transfert: TYPE_TRANSFERT;

  @Prop({ type: String, required: true })
  source_acteur_id: string;

  @Prop({ type: String, required: true, enum: TYPE_ACTEUR })
  source_type_acteur: TYPE_ACTEUR;

  @Prop({ type: String, required: true })
  destination_acteur_id: string;

  @Prop({ type: String, required: true, enum: TYPE_ACTEUR })
  destination_type_acteur: TYPE_ACTEUR;

  @Prop({ type: Number, required: true })
  montant: number;

  @Prop({ type: String, enum: ETAT_TRANSFERT, default: ETAT_TRANSFERT.EN_ATTENTE })
  etat: ETAT_TRANSFERT;

  @Prop({ type: String })
  note: string;

  @Prop({ type: Date })
  date_validation: Date;

  @Prop({ type: String })
  validateur_id: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Session.name, required: true, autopopulate: { select: ['annee', '_id'] } })
  session: Session;
}

export const TransfertVersementSchema = SchemaFactory.createForClass(TransfertVersement);

TransfertVersementSchema.index({ source_acteur_id: 1, source_type_acteur: 1 });
TransfertVersementSchema.index({ destination_acteur_id: 1, destination_type_acteur: 1 });
TransfertVersementSchema.index({ etat: 1 });
TransfertVersementSchema.index({ session: 1 });
TransfertVersementSchema.index({ createdAt: -1 });
