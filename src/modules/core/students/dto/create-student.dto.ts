import { JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class CreateStudentDto {
  @ApiProperty()
  @MinLength(3, { message: 'Мінімальна довжина 3 символа' })
  @IsString()
  name: string;

  @ApiProperty()
  @MinLength(3, { message: 'Мінімальна довжина 3 символа' })
  @IsString()
  login: string;

  @ApiProperty()
  @MinLength(8, { message: 'Мінімальна довжина паролю 8 символів' })
  @IsString()
  password: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @JoinColumn({ name: 'group' })
  group: number | string;
}
