import { ApiProperty } from '@nestjs/swagger';

import { TeachersStatus } from '../entities/teacher.entity';

export class CreateTeacherDto {
  @ApiProperty()
  category: number;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  middleName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  status: TeachersStatus;

  @ApiProperty()
  email: string;

  @ApiProperty()
  password: string;
}
