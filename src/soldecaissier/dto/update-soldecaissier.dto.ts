import { PartialType } from '@nestjs/mapped-types';
import { CreateSoldecaissierDto } from './create-soldecaissier.dto';

export class UpdateSoldecaissierDto extends PartialType(CreateSoldecaissierDto) {}
