import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { GroupEntity } from 'src/groups/entities/group.entity';
import { StreamEntity } from 'src/streams/entities/stream.entity';
import { ScheduleLessonsService } from './schedule-lessons.service';
import { SettingsEntity } from 'src/settings/entities/setting.entity';
import { ScheduleLessonsController } from './schedule-lessons.controller';
import { ScheduleLessonsEntity } from './entities/schedule-lesson.entity';
import { GoogleCalendarService } from 'src/google-calendar/google-calendar.service';
import { GoogleCalendarModule } from 'src/google-calendar/google-calendar.module';

@Module({
  controllers: [ScheduleLessonsController],
  providers: [ScheduleLessonsService],
  imports: [
    TypeOrmModule.forFeature([
      ScheduleLessonsEntity,
      SettingsEntity,
      StreamEntity,
      GroupEntity,
    ]),
    GoogleCalendarModule
  ],
})
export class ScheduleLessonsModule {}
