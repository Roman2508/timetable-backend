import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

import { UserRoles } from '../entities/user.entity';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @MinLength(6, { message: 'Мінімальна довжина паролю 6 символів' })
  @IsString()
  password: string;

  @MinLength(3, { message: 'Мінімальна довжина 3 символа' })
  @IsString()
  login: string;

  @IsString()
  role: UserRoles;

  @IsOptional()
  @IsString()
  roleId?: number;
}
