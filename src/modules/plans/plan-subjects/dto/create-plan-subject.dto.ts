import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreatePlanSubjectDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'Ім`я обов`язкове' })
  @IsString()
  name: string;
 
  @ApiProperty()
  @IsNotEmpty({ message: 'Ім`я обов`язкове' })
  @IsNumber()
  cmk: number;

  @ApiProperty()
  @IsNotEmpty({ message: 'ID навчального плану - обов`язкове поле' })
  @IsNumber()
  planId: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isElective?: boolean;
}
