import { ApiProperty } from '@nestjs/swagger';

export class ChangeStudentsCountDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  students: number;
}
