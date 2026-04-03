import { ApiProperty } from '@nestjs/swagger';

export class SetSubgroupsCountDto {
  @ApiProperty()
  groupId: number;

  @ApiProperty()
  planSubjectId: number;

  @ApiProperty()
  typeEn: string;

  @ApiProperty()
  subgroupsCount: number;
}
