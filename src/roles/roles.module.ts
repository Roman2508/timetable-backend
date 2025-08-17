import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { RolesService } from './roles.service'
import { RoleEntity } from './entities/role.entity'
import { RolesController } from './roles.controller'
import { PermissionEntity } from './entities/permission.entity'

@Module({
  controllers: [RolesController],
  providers: [RolesService],
  imports: [TypeOrmModule.forFeature([RoleEntity, PermissionEntity])],
  exports: [RolesService],
})
export class RolesModule {}
