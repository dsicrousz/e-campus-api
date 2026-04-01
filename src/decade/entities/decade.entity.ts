import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";
import { Session } from "src/session/entities/session.entity";

export type DecadeDocument = HydratedDocument<Decade>;

@Schema({timestamps: true})
export class Decade {
    _id: string;

    @Prop({type: String, required: true})
    nom: string;
    @Prop({type: String, required: true})
    reference: string;
    @Prop({type: Date, required: true})
    dateDebut: Date;
    @Prop({type: Date, required: true})
    dateFin: Date;
    @Prop({type: Boolean, required: true, default: true})
    active: boolean;
    
    @Prop({type: mongoose.Schema.Types.ObjectId, ref: Session.name, required: true, autopopulate: { select: ['annee', '_id'] }})
    session: Session;
}

export const DecadeSchema = SchemaFactory.createForClass(Decade);

