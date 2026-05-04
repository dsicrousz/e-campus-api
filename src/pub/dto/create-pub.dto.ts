import { IsDateString, IsOptional, IsString } from "class-validator";

export class CreatePubDto {
    @IsString()
    titre: string;

    @IsString()
    description: string;

    @IsDateString()
    debut: string

    @IsDateString()
    fin: string

    @IsOptional()
    @IsString()
    image: string;
}
