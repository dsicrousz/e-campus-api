import { IsEnum, IsMongoId, IsNumber, IsOptional, IsString, Min, ValidateIf } from 'class-validator';
import { TypeOperation } from '../entities/operation.entity';

export class CreateOperationDto {
  @IsEnum(TypeOperation, { message: 'Type d\'opération invalide' })
  type: TypeOperation;

  @IsNumber()
  @Min(0, { message: 'Le montant doit être positif' })
  montant: number;

  @IsMongoId({ message: 'Compte invalide' })
  compte: string;

  // Compte destinataire (obligatoire pour TRANSFERT)
  @ValidateIf(o => o.type === TypeOperation.TRANSFERT)
  @IsMongoId({ message: 'Compte destinataire invalide' })
  compteDestinataire?: string;

  // Ticket (obligatoire pour UTILISATION)
  @ValidateIf(o => o.type === TypeOperation.UTILISATION)
  @IsMongoId({ message: 'Ticket invalide' })
  ticket?: string;

  // Service (obligatoire pour UTILISATION)
  @ValidateIf(o => o.type === TypeOperation.UTILISATION)
  @IsMongoId({ message: 'Service invalide' })
  service?: string;

  // Decade (optionnel, sera rempli automatiquement pour UTILISATION dans les services de type restaurant)
  @IsOptional()
  @IsMongoId({ message: 'Decade invalide' })
  decade?: string;

  // Agent de contrôle (obligatoire pour UTILISATION et RECHARGE, optionnel pour TRANSFERT)
  @ValidateIf(o => o.type === TypeOperation.RECHARGE || o.type === TypeOperation.UTILISATION)
  @IsMongoId({ message: 'Agent de contrôle invalide' })
  agentControle?: string;

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsMongoId({ message: 'Session invalide' })
  session: string;
}
