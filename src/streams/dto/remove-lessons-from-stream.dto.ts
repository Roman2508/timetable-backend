import { ApiProperty } from '@nestjs/swagger';

export class RemoveLessonsFromStreamDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  semester: number;

  @ApiProperty()
  typeEn: string;

  @ApiProperty()
  hours: number;

  @ApiProperty()
  subgroupNumber: number;
}
