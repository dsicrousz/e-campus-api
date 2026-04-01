import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum USER_ROLE {
  USER = 'user',
  SUPERADMIN = 'superadmin',
  ADMIN = 'admin',
  VENDEUR = 'vendeur',
  CAISSIER = 'caissier',
  ACP = 'acp',
  CONTROLEUR = 'controleur',
  RECOUVREUR = 'recouvreur',
  REPREUNEUR = 'repreuneur',
  CHEF_RESTAURANT = 'chef_restaurant',
  CHEF_CODIFICATION = 'chef_codification',
  CHEF_SPORT = 'chef_sport',
}

export type UserDocument = User & Document;

@Schema({ timestamps: true,collection:'user' })
export class User {
  _id: string;

  @Prop({ type: String, unique: true, required: true })
  email: string;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: Boolean, required: true })
  emailVerified: boolean;

  @Prop({ type: Array, default: [USER_ROLE.USER] })
  role: string[];

  @Prop({ type: Boolean, required: true })
  banned: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
