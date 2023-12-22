import { ApiProperty } from '@nestjs/swagger';

export class AddLessonsToStreamDto {
  @ApiProperty()
  lessonsIds: number[];

  @ApiProperty()
  streamId: number;
}
