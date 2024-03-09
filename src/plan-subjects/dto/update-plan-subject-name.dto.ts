import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreatePlanSubjectDto } from './create-plan-subject.dto';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class UpdatePlanSubjectNameDto extends PartialType(
  CreatePlanSubjectDto,
) {
  @ApiProperty()
  @IsNotEmpty({ message: 'Ім`я обов`язкове' })
  @IsString()
  oldName: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'Ім`я обов`язкове' })
  @IsString()
  newName: string;
}
