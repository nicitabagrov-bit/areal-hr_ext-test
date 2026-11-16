import { IsString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class CreateAddressDto {
  @IsUUID('4', { message: 'employee_id должен быть валидным UUID' })
  @IsNotEmpty()
  employee_id!: string; // <-- Добавили !

  @IsString()
  @IsNotEmpty({ message: 'Область обязательна' })
  region!: string; // <-- Добавили !

  @IsString()
  @IsNotEmpty({ message: 'Город/Населенный пункт обязателен' })
  city!: string; // <-- Добавили !

  @IsString()
  @IsNotEmpty({ message: 'Улица обязательна' })
  street!: string; // <-- Добавили !

  @IsString()
  @IsNotEmpty({ message: 'Дом обязателен' })
  house!: string; // <-- Добавили !

  @IsString()
  @IsOptional()
  building?: string; // Тут ? уже есть, ! не нужен

  @IsString()
  @IsOptional()
  apartment?: string; // Тут ? уже есть
}