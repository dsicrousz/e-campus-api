import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Type } from 'class-transformer';
import mongoose, { Document } from 'mongoose';
import { TypeService } from '../dto/create-service.dto';
import { Ticket } from "src/ticket/entities/ticket.entity";
import { User } from "src/user/entities/user.entity";
export type ServiceDocument = Service & Document;

@Schema({timestamps: true})
export class Service {

    _id: string;

    @Prop({type: String, required: true})
    nom: string;

    @Prop({type: String, required: true})
    typeService: TypeService;

    @Prop({type: String, required: true})
    gerant: string;

    @Prop({ 
        type: [{type: String}], 
        default: []
    })
    agentsControle: string[];

    @Prop({ 
        type: [{ type: mongoose.Schema.Types.ObjectId, ref: Ticket.name }], 
        default: [],
        autopopulate: true
    })
    @Type(() => Ticket)
    ticketsacceptes: Ticket[];

    @Prop({ type: Map, of: Number, default: () => new Map() })
    prixRepreneur: Map<string, number>;

    @Prop({type: Boolean, required: true, default: true})
    active: boolean;

    @Prop({type: String})
    localisation: string;

    @Prop({type: Number})
    nombre_de_places: number;

    @Prop({type: String})
    description: string;

}

export const ServiceSchema = SchemaFactory.createForClass(Service);

// Index pour recherches fréquentes
ServiceSchema.index({ active: 1 });
ServiceSchema.index({ restaurant: 1 });