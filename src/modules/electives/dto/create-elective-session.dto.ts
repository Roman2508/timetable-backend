import { ApiProperty } from '@nestjs/swagger'
import { IsArray, IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator'

export class CreateElectiveSessionDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string

  @ApiProperty({ required: false, default: 10 })
  @IsOptional()
  @IsNumber()
  minStudentsThreshold?: number

  @ApiProperty({ description: 'ISO date-time', example: '2026-09-01T12:00:00Z' })
  @IsDateString()
  closesAt: string

  @ApiProperty({
    description: 'Map semesterNumber -> n electives, e.g. {"1":1,"2":1}',
    example: { '1': 1, '2': 1 },
  })
  maxElectivesPerSemester: Record<string, number>

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  scopeNote?: string

  @ApiProperty({ type: [Number] })
  @IsArray()
  planSubjectIds: number[]

  @ApiProperty({ type: [Number] })
  @IsArray()
  studentIds: number[]
}

