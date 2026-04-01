import { IsNumber, IsString, Min } from "class-validator";

export class CreateSoldeRecouvreurDto {
  @IsString()
  recouvreur_id: string;

  @IsNumber()
  @Min(0)
  solde?: number;
}
