import { ApiProperty } from '@nestjs/swagger';
import { AuditoriesStatus } from '../entities/auditory.entity';

export class CreateAuditoryDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  seatsNumber: number;

  @ApiProperty()
  status: AuditoriesStatus;

  @ApiProperty()
  category: number;
}
