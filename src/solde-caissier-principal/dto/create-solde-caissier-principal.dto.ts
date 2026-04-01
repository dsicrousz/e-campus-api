import { IsNumber, IsString, Min } from "class-validator";

export class CreateSoldeCaissierPrincipalDto {
  @IsString()
  caissier_principal_id: string;

  @IsNumber()
  @Min(0)
  solde?: number;
}
