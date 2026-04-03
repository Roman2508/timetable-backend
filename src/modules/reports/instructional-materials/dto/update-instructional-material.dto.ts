import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateInstructionalMaterialDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'name is required' })
  @IsString()
  name: string;
}
