import { PartialType } from '@nestjs/mapped-types';
import { CreateDecadeDto } from './create-decade.dto';

export class UpdateDecadeDto extends PartialType(CreateDecadeDto) {}
