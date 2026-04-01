import { IsEmail, IsOptional, IsPhoneNumber, IsString } from "class-validator";

export class CreateEtudiantDto {
  @IsString()
  prenom: string;

  @IsString()
  nom: string;

  @IsEmail()
  email: string;

  @IsPhoneNumber('SN')
  tel: string;

  @IsString()
  dateDeNaissance: string;

  @IsString()
  lieuDeNaissance: string;

  @IsString()
  nationalite: string;

  @IsOptional()
  @IsString()
  avatar: string;

  @IsString()
  ncs: string;
}
