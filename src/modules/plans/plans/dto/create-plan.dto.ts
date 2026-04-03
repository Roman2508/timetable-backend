import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, MinLength } from 'class-validator';

export class CreatePlanDto {
  @ApiProperty()
  @MinLength(3, { message: 'Мінімальна довжина 3 символа' })
  @IsNotEmpty({ message: 'Ім`я обов`язкове' })
  @IsString()
  name: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty({ message: 'Категорія обов`язкова' })
  categoryId: string;
}
