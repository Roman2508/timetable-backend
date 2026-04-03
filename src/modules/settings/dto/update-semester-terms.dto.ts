import { ApiProperty } from '@nestjs/swagger';

export class UpdateSemesterTermsDto {
  @ApiProperty()
  firstSemesterStart: string;

  @ApiProperty()
  firstSemesterEnd: string;

  @ApiProperty()
  secondSemesterStart: string;

  @ApiProperty()
  secondSemesterEnd: string;
}
