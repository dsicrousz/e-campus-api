import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SessionDocument = Session & Document;

@Schema({ timestamps: true })
export class Session {
  _id: string;

  @Prop({ type: String, required: true, unique: true })
  annee: string; // Ex: "2024", "2025"

  @Prop({ type: Date, required: true })
  dateDebut: Date;

  @Prop({ type: Date, required: true })
  dateFin: Date;

  @Prop({ type: Boolean, default: false })
  isActive: boolean; // Une seule session peut être active à la fois

  @Prop({ type: String })
  description?: string;

  createdAt: Date;
  updatedAt: Date;
}

export const SessionSchema = SchemaFactory.createForClass(Session);

// Index pour garantir qu'une seule session est active
SessionSchema.index({ isActive: 1 }, { unique: true, partialFilterExpression: { isActive: true } });
