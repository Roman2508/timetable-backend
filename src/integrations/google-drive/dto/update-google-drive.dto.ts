import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class UpdateGoogleDriveFolderDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'folder ID required' })
  @IsNumber()
  folderId: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'name required' })
  @IsNumber()
  name: string;
}
