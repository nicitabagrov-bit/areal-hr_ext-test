import { IsString, IsNotEmpty, MaxLength, IsOptional, IsDateString, Length, IsEmail, Matches, MaxDate } from 'class-validator';

export class CreateEmployeeDto {
  @IsString()
  @IsNotEmpty({ message: 'Фамилия не может быть пустой' }) // Запрещает null
  @MaxLength(100)
  last_name: string;

  @IsString()
  @IsNotEmpty({ message: 'Имя не может быть пустым' })
  @MaxLength(100)
  first_name: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  middle_name?: string;

  @IsDateString()
  @IsNotEmpty()
  @MaxDate(new Date('2010-01-01'), { message: 'Сотрудник не может быть младше 14 лет' }) // Проверка 2099 года
  birth_date: string;

  @IsString()
  @IsOptional()
  @Matches(/^\+?\d{10,15}$/, { message: 'Неверный формат телефона' }) // Проверка abc
  phone?: string;

  @IsEmail()
  @IsOptional()
  @MaxLength(100)
  email?: string;

  @IsString()
  @IsOptional()
  @Matches(/^\d{4}$/, { message: 'Серия паспорта должна быть 4 цифры' }) // Проверка abcd
  passport_series?: string;

  @IsString()
  @IsOptional()
  @Matches(/^\d{6}$/, { message: 'Номер паспорта должен быть 6 цифр' }) // Проверка zzzzzz
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
  reg_region?: string;
  @IsString()
  @IsOptional()
  reg_locality?: string;
  @IsString()
  @IsOptional()
  reg_street?: string;
  @IsString()
  @IsOptional()
  reg_house?: string;
  @IsString()
  @IsOptional()
  reg_building?: string;
  @IsString()
  @IsOptional()
  reg_apartment?: string;
}