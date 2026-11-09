import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CreatePositionDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;
}