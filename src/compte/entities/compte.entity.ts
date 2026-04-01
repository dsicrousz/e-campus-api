import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Exclude } from "class-transformer";
import { Document, model } from "mongoose";
import { Etudiant } from "../../etudiant/entities/etudiant.entity";
import { randomUUID } from 'crypto';

export type CompteDocument = Compte & Document;

@Schema({timestamps: true,toJSON:{getters:true,virtuals: true}})
export class Compte {

  _id: string;

  @Prop({ type: Number, default: 0 })
  solde: number;

  @Prop({type: String, unique: true, default:randomUUID})
  code: string;

  @Prop({ type: String, required: true })
  @Exclude()
  password: string;

  @Prop({type: String, required: true})
  etudiant: Etudiant;

  @Prop({type: Boolean, default: true})
  is_actif: boolean;

  @Prop({type:Boolean,default:false})
  est_perdu:boolean;

  @Prop({type:Boolean,default:false})
  est_delivre:boolean;
}


export const CompteSchema = SchemaFactory.createForClass(Compte);

CompteSchema.pre('findOneAndDelete',async function(){
  const compte = await this.model.findOne(this.getFilter() as any);
  if(compte) {
    // Supprimer toutes les opérations où ce compte est source ou destinataire
    await model('Operation').deleteMany({
      $or: [
        { compte: compte._id },
        { compteDestinataire: compte._id }
      ]
    } as any);
  }
})