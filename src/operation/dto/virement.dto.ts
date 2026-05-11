import { IsMongoId, IsNumber, Min } from 'class-validator';

export class VirementDto {
  @IsMongoId({ message: 'Compte source invalide' })
  id_from: string;

  @IsMongoId({ message: 'Compte destinataire invalide' })
  id_to: string;

  @IsNumber()
  @Min(1, { message: 'Le montant doit être supérieur à 0' })
  montant: number;
}
