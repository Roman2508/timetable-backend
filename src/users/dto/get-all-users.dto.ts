import { IsNumber, IsOptional, IsString } from 'class-validator';

export class GetAllUsersDto {
  @IsOptional()
  @IsString()
  query: string;

  @IsOptional()
  @IsNumber()
  page: string;

  @IsOptional()
  @IsNumber()
  limit: number;

  @IsOptional()
  @IsNumber()
  offset: number;

  @IsOptional()
  @IsString()
  sortBy: string;

  @IsOptional()
  @IsString()
  order: 'ASC' | 'DESC';
}
