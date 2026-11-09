import { IsString, IsNotEmpty, MaxLength, IsOptional, IsDateString, Length, IsEmail } from 'class-validator';

export class CreateEmployeeDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  last_name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  first_name: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  middle_name?: string;

  @IsDateString()
  @IsNotEmpty()
  birth_date: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  phone?: string;

  @IsEmail()
  @IsOptional()
  @MaxLength(100)
  email?: string;

  @IsString()
  @IsOptional()
  @Length(4, 4)
  passport_series?: string;

  @IsString()
  @IsOptional()
  @Length(6, 6)
  passport_number?: string;

  @IsDateString()
  @IsOptional()
  passport_issue_date?: string;

  @IsString()
  @IsOptional()
  @MaxLength(7)
  passport_department_code?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  passport_issued_by?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  reg_region?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  reg_locality?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  reg_street?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  reg_house?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  reg_building?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  reg_apartment?: string;
}