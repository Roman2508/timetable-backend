import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateInstructionalMaterialDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'name is required' })
  @IsString()
  name: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'lesson number is required' })
  @IsNumber()
  lessonNumber: number;

  @ApiProperty()
  @IsNotEmpty({ message: 'lesson ID is required' })
  @IsNumber()
  lessonId: number;

  @ApiProperty()
  @IsNotEmpty({ message: 'year is required' })
  @IsNumber()
  year: number;
}
