import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateGroupSpecializationDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'Ім`я обов`язкове' })
  @IsString()
  name: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'Це поле обов`язкове' })
  @IsNumber()
  groupId: number;
}
