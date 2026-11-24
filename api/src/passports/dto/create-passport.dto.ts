import { IsString, IsNotEmpty, IsDateString, Length, IsUUID } from 'class-validator';

export class CreatePassportDto {
  @IsUUID('4', { message: 'employee_id должен быть валидным UUID' })
  @IsNotEmpty()
  employee_id!: string; 

  @IsString()
  @Length(4, 4, { message: 'Серия паспорта должна состоять ровно из 4 цифр' })
  series!: string; 

  @IsString()
  @Length(6, 6, { message: 'Номер паспорта должен состоять ровно из 6 цифр' })
  number!: string; 

  @IsDateString({}, { message: 'Дата выдачи должна быть в формате YYYY-MM-DD' })
  issue_date!: string; 

  @IsString()
  @IsNotEmpty({ message: 'Поле "Кем выдан" не может быть пустым' })
  issued_by!: string; 

  @IsString()
  @IsNotEmpty({ message: 'Код подразделения обязателен' })
  department_code!: string; 
}