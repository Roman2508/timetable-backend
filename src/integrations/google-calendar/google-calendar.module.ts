import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { GroupEntity } from 'src/modules/core/groups/entities/group.entity'
import { GoogleCalendarService } from './google-calendar.service'
import { TeacherEntity } from 'src/modules/core/teachers/entities/teacher.entity'
import { SettingsEntity } from 'src/modules/settings/entities/setting.entity'
import { GoogleCalendarController } from './google-calendar.controller'

@Module({
  controllers: [GoogleCalendarController],
  providers: [GoogleCalendarService],
  imports: [TypeOrmModule.forFeature([SettingsEntity, TeacherEntity, GroupEntity])],
  exports: [GoogleCalendarService],
})
export class GoogleCalendarModule {}
