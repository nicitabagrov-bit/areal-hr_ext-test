import { IsString, IsNotEmpty, IsUUID, MinLength, IsOptional } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  last_name!: string;

  @IsString()
  @IsNotEmpty()
  first_name!: string;

  @IsString()
  @IsOptional()
  middle_name?: string;

  @IsString()
  @IsNotEmpty()
  login!: string;

  @IsString()
  @MinLength(6, { message: 'Пароль должен быть не менее 6 символов' })
  password!: string;

  @IsUUID('4', { message: 'role_id должен быть валидным UUID' })
  @IsNotEmpty()
  role_id!: string;
}