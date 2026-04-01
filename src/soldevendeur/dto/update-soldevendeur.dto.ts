import { PartialType } from '@nestjs/mapped-types';
import { CreateSoldevendeurDto } from './create-soldevendeur.dto';

export class UpdateSoldevendeurDto extends PartialType(CreateSoldevendeurDto) {}
