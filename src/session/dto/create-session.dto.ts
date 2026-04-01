import { IsString, IsDateString, IsOptional, IsBoolean, Matches } from 'class-validator';

export class CreateSessionDto {
  @IsString()
  @Matches(/^\d{4}$/, { message: 'L\'année doit être au format YYYY (ex: 2024)' })
  annee: string;

  @IsDateString()
  dateDebut: string;

  @IsDateString()
  dateFin: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  description?: string;
}
