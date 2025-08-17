import { IsEmail, IsNumber, IsOptional, IsString, MinLength } from 'class-validator'

import { UserRoles } from '../entities/user.entity'
import { RoleEntity } from 'src/roles/entities/role.entity'

export class CreateUserDto {
  @IsEmail()
  email: string

  @MinLength(8, { message: 'Мінімальна довжина паролю 8 символів' })
  @IsString()
  password: string

  @IsString()
  name: string

  @IsString()
  role: RoleEntity

  @IsOptional()
  @IsNumber()
  roleId?: number
}
