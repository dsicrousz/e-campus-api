import { IsString, IsNumber, IsOptional, IsBoolean, IsMongoId, Min } from 'class-validator';

export class CreateTicketDto {
  @IsString()
  nom: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  @Min(0)
  prix: number;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
