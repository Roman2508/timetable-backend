import { Module } from '@nestjs/common';
import { ScheduleLessonsService } from './schedule-lessons.service';
import { ScheduleLessonsController } from './schedule-lessons.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleLessonsEntity } from './entities/schedule-lesson.entity';
import { StreamEntity } from 'src/streams/entities/stream.entity';

@Module({
  controllers: [ScheduleLessonsController],
  providers: [ScheduleLessonsService],
  imports: [TypeOrmModule.forFeature([ScheduleLessonsEntity, StreamEntity])],
})
export class ScheduleLessonsModule {}
