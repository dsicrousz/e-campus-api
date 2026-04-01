import {
  IsArray,
  IsBoolean,
  IsOptional,
  IsPhoneNumber,
  IsString,
} from 'class-validator';

export class UpdateEtudiantProfileDto {
  @IsOptional()
  @IsPhoneNumber('SN')
  telSecondaire?: string;

  @IsOptional()
  @IsString()
  adresse?: string;

  @IsOptional()
  @IsString()
  ville?: string;

  @IsOptional()
  @IsString()
  pays?: string;

  @IsOptional()
  @IsString()
  quartier?: string;

  @IsOptional()
  @IsString()
  campus?: string;

  @IsOptional()
  @IsBoolean()
  residentCampus?: boolean;

  @IsOptional()
  @IsString()
  pavillon?: string;

  @IsOptional()
  @IsString()
  chambre?: string;

  @IsOptional()
  @IsString()
  contactUrgenceNom?: string;

  @IsOptional()
  @IsString()
  contactUrgenceLien?: string;

  @IsOptional()
  @IsPhoneNumber('SN')
  contactUrgenceTel?: string;

  @IsOptional()
  @IsString()
  groupeSanguin?: string;

  @IsOptional()
  @IsArray()
  allergies?: string[];

  @IsOptional()
  @IsArray()
  hobbies?: string[];

  @IsOptional()
  @IsBoolean()
  accepteConditions?: boolean;
}
