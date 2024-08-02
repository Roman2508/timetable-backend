import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateGoogleDriveFolderDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'name required' })
  @IsNumber()
  name: string;
}
