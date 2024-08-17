import { IsEmail, IsNumber, IsOptional, IsString, MinLength } from 'class-validator';

import { UserRoles } from '../entities/user.entity';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @MinLength(8, { message: 'Мінімальна довжина паролю 8 символів' })
  @IsString()
  password: string;

  @IsString()
  role: UserRoles;

  @IsOptional()
  @IsNumber()
  roleId?: number;
}
