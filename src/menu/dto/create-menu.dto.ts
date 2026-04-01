import { IsNotEmpty, IsString, IsMongoId, IsArray, IsOptional, IsDateString } from 'class-validator';


export class CreateMenuDto {

  @IsNotEmpty()
  @IsString()
  nom: string;

  @IsNotEmpty()
  @IsDateString()
  date: Date;

  @IsMongoId()
  @IsNotEmpty()
  service: string;

  @IsArray()
  @IsNotEmpty()
  plats: string[];

  @IsString()
  @IsOptional()
  notes?: string;
}
