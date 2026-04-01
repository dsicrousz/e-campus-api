import { IsArray, IsBoolean, IsEnum, IsMongoId, IsNumber, IsObject, IsOptional, IsString } from "class-validator";

export enum TypeService {
  RESTAURANT = 'restaurant',
  SPORT = 'sport',
  MEDICAL = 'medical',
  CULTURE = 'culture',
  LOGEMENT = 'logement',
  AUTRE = 'autre',
}

export class CreateServiceDto {
    @IsString()
    nom: string;


    @IsMongoId()
    gerant:string;

    @IsEnum(TypeService)
    typeService: TypeService;

    @IsArray()
    @IsMongoId({ each: true })
    agentsControle?: string[];

    @IsArray()
    @IsMongoId({ each: true })
    ticketsacceptes?: string[];

    @IsOptional()
    @IsObject()
    prixRepreneur?: Record<string, number>;

    @IsOptional()
    @IsBoolean()
    active?: boolean;

    @IsOptional()
    @IsString()
    localisation?: string;

    @IsOptional()
    @IsNumber()
    nombre_de_places?: number;

    @IsOptional()
    @IsString()
    description?: string;
}
