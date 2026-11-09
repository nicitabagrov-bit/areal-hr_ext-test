import { IsString, IsNotEmpty, MaxLength, IsOptional, IsUUID } from 'class-validator';

export class CreateDepartmentDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @IsString()
  @IsOptional()
  comment?: string;

  @IsUUID()
  @IsNotEmpty()
  organization_id: string;

  @IsUUID()
  @IsOptional()
  parent_id?: string;
}
