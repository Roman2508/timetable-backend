import { Module } from '@nestjs/common';
import { IndividualTeacherWorkService } from './individual-teacher-work.service';
import { IndividualTeacherWorkController } from './individual-teacher-work.controller';

@Module({
  controllers: [IndividualTeacherWorkController],
  providers: [IndividualTeacherWorkService],
})
export class IndividualTeacherWorkModule {}
