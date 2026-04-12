import { ApiProperty } from '@nestjs/swagger'
import { IsArray, IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator'

import { ElectiveSessionDistributionMode } from '../entities/elective-session.entity'

const ELECTIVE_DISTRIBUTION_MODE = {
  BY_GROUP: 'BY_GROUP',
  MIXED: 'MIXED',
} as const

export class CreateElectiveSessionDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string

  @ApiProperty({ required: false, default: 15 })
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

  @ApiProperty({ type: [Number], description: 'Snapshot list of selected groups for this session' })
  @IsArray()
  groupIds: number[]

  @ApiProperty({ type: [Number] })
  @IsArray()
  planSubjectIds: number[]

  @ApiProperty({ type: [Number] })
  @IsArray()
  studentIds: number[]

  @ApiProperty({ enum: ['BY_GROUP', 'MIXED'], required: false, default: 'BY_GROUP' })
  @IsOptional()
  @IsEnum(ELECTIVE_DISTRIBUTION_MODE)
  distributionMode?: ElectiveSessionDistributionMode

  @ApiProperty({ required: false, default: 30 })
  @IsOptional()
  @IsNumber()
  maxStudentsPerOffering?: number

  @ApiProperty({ required: false, default: 5 })
  @IsOptional()
  @IsNumber()
  minSharedGroupSize?: number
}

