import { IsString, IsOptional, IsUUID, MinLength } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  last_name?: string;

  @IsString()
  @IsOptional()
  first_name?: string;

  @IsString()
  @IsOptional()
  middle_name?: string;

  @IsString()
  @MinLength(6, { message: 'Пароль должен быть не менее 6 символов' })
  @IsOptional()
  password?: string;

  @IsUUID('4', { message: 'role_id должен быть валидным UUID' })
  @IsOptional()
  role_id?: string;
}