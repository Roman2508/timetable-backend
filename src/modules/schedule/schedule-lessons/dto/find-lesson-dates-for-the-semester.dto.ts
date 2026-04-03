import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class FindAllLessonDatesForTheSemesterDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'group ID required' })
  @IsNumber()
  groupId: number;

  @ApiProperty()
  @IsNotEmpty({ message: 'semester required' })
  @IsNumber()
  semester: number;

  @ApiProperty()
  @IsNotEmpty({ message: 'lesson name required' })
  @IsString()
  lessonName: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'lessons type required' })
  @IsString()
  type: string;

  @ApiProperty()
  @IsNumber()
  stream?: number | undefined;

  @ApiProperty()
  @IsNumber()
  subgroupNumber?: number | undefined;

  @ApiProperty()
  @IsString()
  specialization?: string | undefined;
}
