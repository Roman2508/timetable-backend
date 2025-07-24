import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { RoleEntity } from './entities/role.entity';
import { PermissionEntity } from './entities/permission.entity';

@Module({
  controllers: [RolesController],
  providers: [RolesService],
  imports: [TypeOrmModule.forFeature([RoleEntity, PermissionEntity])],
})
export class RolesModule {}
