import { Prop, Schema,SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type SoldevendeurDocument = HydratedDocument<Soldevendeur>;

@Schema({timestamps:true})
export class Soldevendeur {
     _id:string;

    @Prop({type: String, required: true,unique:true})
    vendeur_id:string;

    @Prop({ type: Number })
    solde: number; // Map avec ticketId comme clé et nombre de tickets comme valeur
}

export const SoldevendeurSchema = SchemaFactory.createForClass(Soldevendeur);

