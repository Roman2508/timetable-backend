import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator'
import { RoleEntity } from 'src/roles/entities/role.entity'

import { UserRoles } from 'src/users/entities/user.entity'

export class AuthDto {
  @ApiProperty()
  @IsEmail()
  email: string

  @ApiProperty()
  @IsString()
  name: string

  @ApiProperty()
  @MinLength(6, { message: 'Мінімальна довжина паролю 6 символів' })
  @IsString()
  password: string

  @ApiProperty()
  @IsOptional()
  @IsString()
  role: RoleEntity

  @IsOptional()
  @IsString()
  roleId?: number
}

export class LoginDto {
  @ApiProperty()
  @IsEmail()
  email: string

  @ApiProperty()
  @MinLength(6, { message: 'Мінімальна довжина паролю 6 символів' })
  @IsString()
  password: string
}

export class GetMeDto {
  @ApiProperty()
  @IsString()
  token: string
}

export class AuthGoogleDto {
  @ApiProperty()
  @IsEmail()
  email: string
}
