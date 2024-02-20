import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class UpdatePlanSubjectNameDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'Ім`я обов`язкове' })
  @IsString()
  oldName: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'Ім`я обов`язкове' })
  @IsString()
  newName: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'ID навчального плану - обов`язкове поле' })
  @IsNumber()
  planId: number;
}
