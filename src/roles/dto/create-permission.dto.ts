import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreatePermissionDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'This field is required' })
  @IsNumber()
  roleId: number;

  @ApiProperty()
  @IsNotEmpty({ message: 'This field is required' })
  @IsString()
  page: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'This field is required' })
  @IsString()
  action: string;
}
