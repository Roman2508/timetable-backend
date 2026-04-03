import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class AddSummaryDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'after lesson is required' })
  @IsNumber()
  afterLesson: number;

  @ApiProperty()
  @IsNotEmpty({ message: 'summary type is required' })
  @IsString()
  type: string;
}
