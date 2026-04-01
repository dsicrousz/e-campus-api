import { Prop, Schema,SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type SoldecaissierDocument = HydratedDocument<Soldecaissier>;

@Schema({timestamps:true})
export class Soldecaissier {
    _id:string;

    @Prop({type: String, required: true,unique:true})
    caissier_id:string;

    @Prop({ type: Number })
    solde: number;
}

export const SoldecaissierSchema = SchemaFactory.createForClass(Soldecaissier)
