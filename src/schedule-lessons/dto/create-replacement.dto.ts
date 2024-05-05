import { ApiProperty } from '@nestjs/swagger';

export class CreateReplacementDto {
  @ApiProperty()
  lessonId: number;

  @ApiProperty()
  teacherId: number;
}
