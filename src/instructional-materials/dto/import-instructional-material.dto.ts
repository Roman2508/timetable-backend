import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsNumber, IsString, ValidateNested } from 'class-validator';

export class ImportInstructionalMaterialDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'lesson ID is required' })
  @IsNumber()
  lessonId: number;

  @ApiProperty()
  @IsNotEmpty({ message: 'year is required' })
  @IsNumber()
  year: number;

  @ApiProperty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Themes)
  themes: Themes[];
}

class Themes {
  @ApiProperty()
  @IsNotEmpty({ message: 'name is required' })
  @IsString()
  name: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'lesson number is required' })
  @IsNumber()
  lessonNumber: number;
}
