import { Module } from '@nestjs/common';
import { StreamsService } from './streams.service';
import { StreamsController } from './streams.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StreamEntity } from './entities/stream.entity';
import { GroupLoadLessonsModule } from 'src/group-load-lessons/group-load-lessons.module';
import { GroupLoadLessonEntity } from 'src/group-load-lessons/entities/group-load-lesson.entity';

@Module({
  controllers: [StreamsController],
  providers: [StreamsService],
  imports: [
    TypeOrmModule.forFeature([StreamEntity, GroupLoadLessonEntity]),
    GroupLoadLessonsModule,
  ],
})
export class StreamsModule {}
