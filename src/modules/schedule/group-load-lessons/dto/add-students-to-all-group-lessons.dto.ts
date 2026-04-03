import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class AddStudentsToAllGroupLessonsDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'group ID is required' })
  @IsNumber()
  groupId: number;

  @ApiProperty()
  @IsNotEmpty({ message: 'semester is required' })
  @IsNumber()
  semester: number;

  @ApiProperty()
  @IsNotEmpty({ message: 'students ID is required' })
  studentIds: number[];
}
