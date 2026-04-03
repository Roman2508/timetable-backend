import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { GroupsService } from './groups.service'
import { GroupEntity } from './entities/group.entity'
import { GroupsController } from './groups.controller'
import { GradeBookModule } from 'src/modules/grade-book/grade-book/grade-book.module'
import { GoogleCalendarModule } from 'src/integrations/google-calendar/google-calendar.module'
import { GroupLoadLessonsModule } from 'src/modules/schedule/group-load-lessons/group-load-lessons.module'

@Module({
  controllers: [GroupsController],
  providers: [GroupsService],
  imports: [TypeOrmModule.forFeature([GroupEntity]), GroupLoadLessonsModule, GoogleCalendarModule, GradeBookModule],
})
export class GroupsModule {}
