import { IsNotEmpty, IsString, IsOptional, IsArray, IsMongoId } from 'class-validator';

export class CreateDishDto {
  @IsNotEmpty()
  @IsString()
  nom: string;

  @IsOptional()
  @IsString()
  image: string;

  @IsMongoId()
  @IsNotEmpty()
  ticket: string;

  @IsOptional()
  @IsString()
  description: string;

  @IsMongoId()
  @IsNotEmpty()
  service: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  ingredients?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  allergenes?: string[];
}
