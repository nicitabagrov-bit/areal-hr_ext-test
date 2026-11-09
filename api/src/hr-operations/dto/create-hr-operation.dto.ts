import { IsString, IsNotEmpty, IsOptional, IsUUID, IsIn, IsNumber } from 'class-validator';

export class CreateHrOperationDto {
  @IsUUID()
  @IsNotEmpty()
  employee_id: string;

  @IsUUID()
  @IsOptional()
  department_id?: string;

  @IsUUID()
  @IsOptional()
  position_id?: string;

  @IsString()
  @IsIn(['hire', 'salary_set', 'salary_change', 'department_change', 'dismissal'])
  operation_type: string;

  @IsNumber()
  @IsOptional()
  salary?: number;
}