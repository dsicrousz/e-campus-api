import { IsEnum, IsNumber, IsOptional, IsString, Min } from "class-validator";
import { TYPE_ACTEUR } from "src/historique-solde/entities/historique-solde.entity";
import { TYPE_TRANSFERT } from "../entities/transfert-versement.entity";

export class CreateTransfertVersementDto {
  @IsEnum(TYPE_TRANSFERT)
  type_transfert: TYPE_TRANSFERT;

  @IsString()
  source_acteur_id: string;

  @IsEnum(TYPE_ACTEUR)
  source_type_acteur: TYPE_ACTEUR;

  @IsString()
  destination_acteur_id: string;

  @IsEnum(TYPE_ACTEUR)
  destination_type_acteur: TYPE_ACTEUR;

  @IsNumber()
  @Min(1, { message: "Le montant doit être supérieur à 0" })
  montant: number;

  @IsOptional()
  @IsString()
  note?: string;
}

export class TransfertVendeurRecouvreurDto {
  @IsString()
  vendeur_id: string;

  @IsString()
  recouvreur_id: string;

  @IsNumber()
  @Min(1, { message: "Le montant doit être supérieur à 0" })
  montant: number;

  @IsOptional()
  @IsString()
  note?: string;
}

export class TransfertRecouvreurCaissierPrincipalDto {
  @IsString()
  recouvreur_id: string;

  @IsString()
  caissier_principal_id: string;

  @IsNumber()
  @Min(1, { message: "Le montant doit être supérieur à 0" })
  montant: number;

  @IsOptional()
  @IsString()
  note?: string;
}

export class TransfertCaissierPrincipalAgentComptableDto {
  @IsString()
  caissier_principal_id: string;

  @IsString()
  agent_comptable_id: string;

  @IsNumber()
  @Min(1, { message: "Le montant doit être supérieur à 0" })
  montant: number;

  @IsOptional()
  @IsString()
  note?: string;
}

export class ValiderTransfertDto {
  @IsString()
  validateur_id: string;
}
