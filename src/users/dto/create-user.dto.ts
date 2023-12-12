import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @MinLength(6, { message: 'Мінімальна довжина паролю 6 символів' })
  @IsString()
  password: string;

  @MinLength(3, { message: 'Мінімальна довжина 3 символа' })
  @IsString()
  fullName: string;

  @IsOptional()
  @IsString()
  access?: 'admin' | 'user';
}
