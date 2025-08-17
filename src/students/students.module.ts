import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { StudentsService } from './students.service'
import { UsersModule } from 'src/users/users.module'
import { RolesModule } from 'src/roles/roles.module'
import { StudentEntity } from './entities/student.entity'
import { StudentsController } from './students.controller'
import { UserEntity } from 'src/users/entities/user.entity'
import { GroupEntity } from 'src/groups/entities/group.entity'

@Module({
  controllers: [StudentsController],
  providers: [StudentsService],
  imports: [TypeOrmModule.forFeature([StudentEntity, GroupEntity, UserEntity]), UsersModule, RolesModule],
})
export class StudentsModule {}
