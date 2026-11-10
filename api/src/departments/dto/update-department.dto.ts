import { IsString, IsOptional, MaxLength } from 'class-validator';

export class UpdateDepartmentDto {
  @IsString()
  @IsOptional()
  @MaxLength(255)
  name?: string;

  @IsString()
  @IsOptional()
  comment?: string;

  @IsString()
  @IsOptional()
  organization_id?: string;

  @IsString() // <-- Заменили @IsUUID() на @IsString()
  @IsOptional()
  parent_id?: string;
}