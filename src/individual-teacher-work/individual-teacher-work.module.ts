import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { IndividualTeacherWorkService } from './individual-teacher-work.service';
import { IndividualTeacherWorkController } from './individual-teacher-work.controller';
import { IndividualTeacherWorkEntity } from './entities/individual-teacher-work.entity';

@Module({
  controllers: [IndividualTeacherWorkController],
  providers: [IndividualTeacherWorkService],
  imports: [TypeOrmModule.forFeature([IndividualTeacherWorkEntity])],
})
export class IndividualTeacherWorkModule {}
