import { IsBoolean, IsDate, IsString } from 'class-validator';

export class CreateDecadeDto {
  @IsString()
  nom: string;

  @IsString()
  reference: string;

  @IsDate()
  dateDebut: Date;

  @IsDate()
  dateFin: Date;

  @IsBoolean()
  active: boolean;
}
