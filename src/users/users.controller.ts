import { ApiTags } from '@nestjs/swagger';
import { Controller, Post, Body, Patch, Param, Delete, Get } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserRoles } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';

@Controller('users')
@ApiTags('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  get() {
    // return this.usersService.get();
  }

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Patch()
  update(@Body() dto: UpdateUserDto) {
    return this.usersService.update(dto);
  }

  @Patch('/role')
  updateRole(@Body() dto: UpdateUserRoleDto) {
    return this.usersService.updateRole(dto);
  }

  @Patch('/picture')
  updatePicture(@Body() dto: any) {
    return this.usersService.updatePicture();
  }

  @Delete('/:id/:role')
  delete(@Param('id') id: string, @Param('role') role: UserRoles) {
    return this.usersService.delete({ id: +id, role });
  }
}
