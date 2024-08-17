import { UserRoles } from '../entities/user.entity';
import { IsNumber, IsString } from 'class-validator';

export class DeleteUserDto {
  @IsNumber()
  id: number;

  @IsString()
  role: UserRoles;
}
