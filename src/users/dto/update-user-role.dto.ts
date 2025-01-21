import { IsNumber, IsString } from 'class-validator';

import { UserRoles } from '../entities/user.entity';

export class UpdateUserRoleDto {
  @IsNumber()
  id: number;

  @IsString()
  newRoles: UserRoles;
}
