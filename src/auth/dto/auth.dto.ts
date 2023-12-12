import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

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
  fullName: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  access?: 'admin' | 'user';
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
