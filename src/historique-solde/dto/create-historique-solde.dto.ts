import { IsEnum, IsNumber, IsOptional, IsString, Min } from "class-validator";
import { TYPE_ACTEUR, TYPE_MOUVEMENT } from "../entities/historique-solde.entity";

export class CreateHistoriqueSoldeDto {
  @IsString()
  acteur_id: string;

  @IsEnum(TYPE_ACTEUR)
  type_acteur: TYPE_ACTEUR;

  @IsEnum(TYPE_MOUVEMENT)
  type_mouvement: TYPE_MOUVEMENT;

  @IsNumber()
  @Min(0)
  montant: number;

  @IsNumber()
  solde_avant: number;

  @IsNumber()
  solde_apres: number;

  @IsOptional()
  @IsString()
  source_acteur_id?: string;

  @IsOptional()
  @IsEnum(TYPE_ACTEUR)
  source_type_acteur?: TYPE_ACTEUR;

  @IsOptional()
  @IsString()
  destination_acteur_id?: string;

  @IsOptional()
  @IsEnum(TYPE_ACTEUR)
  destination_type_acteur?: TYPE_ACTEUR;

  @IsOptional()
  @IsString()
  reference_versement_id?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
