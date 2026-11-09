import { PartialType } from '@nestjs/mapped-types';
import { CreateHrOperationDto } from './create-hr-operation.dto.js';

export class UpdateHrOperationDto extends PartialType(CreateHrOperationDto) {}