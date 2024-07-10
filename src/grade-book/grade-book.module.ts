import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { GradeBookService } from './grade-book.service';
import { GradeBookController } from './grade-book.controller';
import { GradeBookEntity } from './entities/grade-book.entity';
import { GradesEntity } from 'src/grades/entities/grade.entity';

@Module({
  controllers: [GradeBookController],
  providers: [GradeBookService],
  imports: [TypeOrmModule.forFeature([GradeBookEntity, GradesEntity])],
  exports: [GradeBookService],
})
export class GradeBookModule {}
