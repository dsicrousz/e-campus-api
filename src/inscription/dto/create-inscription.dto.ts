import { IsBoolean, IsMongoId, IsOptional } from "class-validator";

export class CreateInscriptionDto {
    @IsMongoId()
    etudiant: string;

    @IsMongoId()
    session:string;

    @IsMongoId()
    formation:string;

    @IsOptional()
    @IsBoolean()
    active:boolean;

    @IsOptional()
    @IsBoolean()
    is_codified:boolean;
}
