import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsObject } from 'class-validator'

export class PatchElectiveSessionChoiceDto {
  @ApiProperty({ description: '{ [semesterNumber]: planSubjectId[] }' })
  @IsObject()
  @IsNotEmpty()
  prioritiesBySemester: Record<string, number[]>
}

