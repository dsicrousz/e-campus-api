import { IsOptional, IsString } from "class-validator";

export class CreatePubDto {
    @IsString()
    titre: string;

    @IsString()
    description: string;

    @IsString()
    debut: string

    @IsString()
    fin: string

    @IsOptional()
    @IsString()
    image: string;
}
