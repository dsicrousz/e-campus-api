import { PartialType } from '@nestjs/mapped-types';
import { CreateCompteDto } from './create-compte.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateCompteDto extends PartialType(CreateCompteDto) {
    @IsOptional()
    @IsBoolean()
    est_perdu?:boolean;

    @IsOptional()
    @IsBoolean()
    est_delivre?:boolean;
}
