import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { GradesService } from './grades.service';
import { GradesController } from './grades.controller';
import { GradesEntity } from './entities/grade.entity';

@Module({
  controllers: [GradesController],
  providers: [GradesService],
  imports: [TypeOrmModule.forFeature([GradesEntity])],
})
export class GradesModule {}
