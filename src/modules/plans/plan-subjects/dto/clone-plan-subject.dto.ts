import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsNumber, IsString } from 'class-validator'

export class ClonePlanSubjectDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'ID навчального плану - обов`язкове поле' })
  @IsNumber()
  planId: number

  @ApiProperty()
  @IsNotEmpty({ message: "Ім'я дисципліни для копіювання - обов'язкове поле" })
  @IsString()
  sourceName: string

  @ApiProperty()
  @IsNotEmpty({ message: "Ім'я нової дисципліни - обов'язкове поле" })
  @IsString()
  newName: string

  @ApiProperty()
  @IsNotEmpty({ message: 'Циклова комісія - обов`язкове поле' })
  @IsNumber()
  cmk: number
}
