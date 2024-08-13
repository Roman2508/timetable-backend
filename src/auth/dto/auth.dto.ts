import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

import { UserRoles } from 'src/users/entities/user.entity';

export class AuthDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @MinLength(6, { message: 'Мінімальна довжина паролю 6 символів' })
  @IsString()
  password: string;

  @ApiProperty()
  @MinLength(3, { message: 'Мінімальна довжина 3 символа' })
  @IsString()
  login: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  role: UserRoles;

  @IsOptional()
  @IsString()
  roleId?: number;
}

export class LoginDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @MinLength(6, { message: 'Мінімальна довжина паролю 6 символів' })
  @IsString()
  password: string;
}

export class GetMeDto {
  @ApiProperty()
  @IsString()
  token: string;
}

export class AuthGoogleDto {
  @ApiProperty()
  @IsEmail()
  email: string;
}
