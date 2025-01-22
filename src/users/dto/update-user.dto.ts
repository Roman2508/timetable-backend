import { IsEmail, IsNumber, IsString, MinLength } from 'class-validator';

import { UserRoles } from '../entities/user.entity';

export class UpdateUserDto {
  @IsEmail()
  email: string;

  @MinLength(8, { message: 'Мінімальна довжина паролю 8 символів' })
  @IsString()
  password?: string;

  @IsString()
  role: UserRoles[];
}
