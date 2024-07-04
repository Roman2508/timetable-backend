import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { GradesService } from './grades.service';
import { GradesController } from './grades.controller';
import { GradesEntity } from './entities/grade.entity';
import { GradeBookEntity } from 'src/grade-book/entities/grade-book.entity';

@Module({
  controllers: [GradesController],
  providers: [GradesService],
  imports: [TypeOrmModule.forFeature([GradesEntity, GradeBookEntity])],
  exports: [GradesService],
})
export class GradesModule {}
