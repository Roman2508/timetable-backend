import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroupsService } from './groups.service';
import { GroupEntity } from './entities/group.entity';
import { GroupsController } from './groups.controller';
import { GoogleCalendarModule } from 'src/google-calendar/google-calendar.module';
import { GroupLoadLessonsModule } from 'src/group-load-lessons/group-load-lessons.module';

@Module({
  controllers: [GroupsController],
  providers: [GroupsService],
  imports: [
    TypeOrmModule.forFeature([GroupEntity]),
    GroupLoadLessonsModule,
    GoogleCalendarModule,
  ],
})
export class GroupsModule {}
