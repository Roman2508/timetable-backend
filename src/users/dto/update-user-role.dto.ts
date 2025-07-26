import { IsNumber, IsString } from 'class-validator';

export class UpdateUserRoleDto {
  @IsNumber()
  userId: number;

  @IsString()
  newRoleId: number;
}
