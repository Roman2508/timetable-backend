import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { UsersModule } from '../users/users.module'
import { TeachersService } from './teachers.service'
import { RolesModule } from 'src/roles/roles.module'
import { TeacherEntity } from './entities/teacher.entity'
import { TeachersController } from './teachers.controller'
import { UserEntity } from 'src/users/entities/user.entity'
import { GoogleDriveModule } from 'src/google-drive/google-drive.module'
import { GoogleCalendarModule } from 'src/google-calendar/google-calendar.module'

@Module({
  controllers: [TeachersController],
  providers: [TeachersService],
  imports: [
    TypeOrmModule.forFeature([TeacherEntity, UserEntity]),
    GoogleCalendarModule,
    GoogleDriveModule,
    UsersModule,
    RolesModule,
  ],
})
export class TeachersModule {}
