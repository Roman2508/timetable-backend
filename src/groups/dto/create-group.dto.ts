import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateGroupDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'Ім`я обов`язкове' })
  @IsString()
  name: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'Це поле обов`язкове' })
  @IsNumber()
  category: number;

  @ApiProperty()
  @IsNotEmpty({ message: 'Це поле обов`язкове' })
  @IsNumber()
  students: number;

  @ApiProperty()
  @IsNotEmpty({ message: 'Це поле обов`язкове' })
  @IsNumber()
  courseNumber: number;

  @ApiProperty()
  @IsNotEmpty({ message: 'Це поле обов`язкове' })
  @IsNumber()
  yearOfAdmission: number;

  @ApiProperty()
  @IsNotEmpty({ message: 'Це поле обов`язкове' })
  @IsNumber()
  formOfEducation: 'Денна' | 'Заочна';

  @ApiProperty()
  @IsNotEmpty({ message: 'Це поле обов`язкове' })
  @IsNumber()
  educationPlan: number;
}
