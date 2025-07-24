import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateRoleDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'this field is required' })
  @IsString()
  name: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'this field is required' })
  @IsString()
  key: string;
}
