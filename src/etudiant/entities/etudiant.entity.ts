import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from 'mongoose';

export type EtudiantDocument = Etudiant & Document;

@Schema({timestamps: true})
export class Etudiant {
    _id: string;

    @Prop({type: String, required: true})
    prenom: string;
  
    @Prop({type: String, required: true})
    nom: string;
  
    @Prop({type: String, required: true})
    email: string;
  
    @Prop({type: String, required: true, unique: true, max: 14})
    tel: string;
  
    @Prop({type: String, required: true})
    dateDeNaissance: string;
  
    @Prop({type: String, required: true})
    lieuDeNaissance: string;

    @Prop({type: String, required: true})
    nationalite: string;
  
    @Prop({type: String})
    avatar?: string;
  
    @Prop({type: String, required: true, unique: true})
    ncs: string;

    @Prop({type: String})
    campus?: string;

    @Prop({type: Boolean, default: false})
    residentCampus?: boolean;

    @Prop({type: String})
    pavillon?: string;

    @Prop({type: String})
    chambre?: string;

    @Prop({type: String})
    contactUrgenceNom?: string;

    @Prop({type: String})
    contactUrgenceLien?: string;

    @Prop({type: String})
    contactUrgenceTel?: string;

    @Prop({type: String})
    groupeSanguin?: string;

    @Prop({type: Array})
    allergies?: string[];

    @Prop({type: Array})
    hobbies?: string[];

    @Prop({type: Boolean, default: false})
    accepteConditions?: boolean;
}

export const EtudiantSchema = SchemaFactory.createForClass(Etudiant);