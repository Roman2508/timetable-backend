import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { GroupEntity } from 'src/modules/core/groups/entities/group.entity'
import { StreamEntity } from 'src/modules/core/streams/entities/stream.entity'
import { ScheduleLessonsService } from './schedule-lessons.service'
import { SettingsEntity } from 'src/modules/settings/entities/setting.entity'
import { ScheduleLessonsController } from './schedule-lessons.controller'
import { ScheduleLessonsEntity } from './entities/schedule-lesson.entity'
import { GoogleCalendarService } from 'src/integrations/google-calendar/google-calendar.service'
import { GoogleCalendarModule } from 'src/integrations/google-calendar/google-calendar.module'
import { GroupLoadLessonEntity } from 'src/modules/schedule/group-load-lessons/entities/group-load-lesson.entity'

@Module({
  controllers: [ScheduleLessonsController],
  providers: [ScheduleLessonsService],
  imports: [
    TypeOrmModule.forFeature([ScheduleLessonsEntity, GroupLoadLessonEntity, SettingsEntity, StreamEntity, GroupEntity]),
    GoogleCalendarModule,
  ],
})
export class ScheduleLessonsModule {}
