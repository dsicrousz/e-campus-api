import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type PubDocument = Pub & Document;

@Schema({timestamps: true})
export class Pub {
    _id:string;

    @Prop({type: String, required: true})
    titre: string;

    @Prop({type: String, required: true})
    description: string;

    @Prop({type: Date, required: true})
    debut: string;

    @Prop({type: Date, required: true})
    fin: string;

    @Prop({type: String, required: true})
    image: string;
}

export const PubSchema = SchemaFactory.createForClass(Pub);