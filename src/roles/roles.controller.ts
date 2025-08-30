import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';

import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
// import { JwtAuthGuard } from 'src/auth/guards/auth.guard';
import { PermissionEntity } from './entities/permission.entity';
import { CreatePermissionDto } from './dto/create-permission.dto';
// import { UpdatPermissionDto } from './dto/update-permission.dto';

@Controller('roles')
@ApiTags('roles')
// @UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}
  @Get()
  getAll() {
    return this.rolesService.getAll();
  }

  @Get(':id')
  getFull(@Param('id') id: string) {
    return this.rolesService.getFull(+id);
  }

  @Get('byKey/:key')
  getByKey(@Param('key') key: string) {
    return this.rolesService.getByKey(key);
  }

  @Post()
  createRole(@Body() dto: CreateRoleDto) {
    return this.rolesService.createRole(dto);
  }

  @Patch(':id')
  updateRole(@Param('id') id: string, @Body() dto: UpdateRoleDto) {
    return this.rolesService.updateRole(+id, dto);
  }

  @Delete(':id')
  deleteRole(@Param('id') id: string) {
    return this.rolesService.deleteRole(+id);
  }

  @Post('permission')
  createPermission(@Body() dto: CreatePermissionDto) {
    return this.rolesService.createPermission(dto);
  }

  @Delete('permission/:id')
  deletePermission(@Param('id') id: string) {
    return this.rolesService.deletePermission(+id);
  }
}
