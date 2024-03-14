import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class UpdateGroupSpecializationDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'Ім`я обов`язкове' })
  @IsString()
  oldName: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'Ім`я обов`язкове' })
  @IsString()
  newName: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'Це поле обов`язкове' })
  @IsNumber()
  groupId: number;
}
