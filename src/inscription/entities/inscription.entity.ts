import { SchemaFactory } from "@nestjs/mongoose";
import { Document} from "mongoose";

export type InscriptionDocument = Inscription & Document;

export class Inscription {
    _id: string;

    etudiant: object;

    session:string;
    formation:object;

    active:boolean;

    is_codified:boolean;
}


export const InscriptionSchema = SchemaFactory.createForClass(Inscription);