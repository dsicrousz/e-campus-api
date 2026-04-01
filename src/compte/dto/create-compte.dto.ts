import { IsMongoId, IsNumber, IsOptional, IsString} from "class-validator";

export class CreateCompteDto {
    @IsOptional()
    @IsNumber()
    solde?: number;

    @IsMongoId()
    etudiant: string;

    @IsString()
    password: string;
}
