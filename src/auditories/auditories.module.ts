import { Module } from '@nestjs/common';
import { AuditoriesService } from './auditories.service';
import { AuditoriesController } from './auditories.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditoryEntity } from './entities/auditory.entity';

@Module({
  controllers: [AuditoriesController],
  providers: [AuditoriesService],
  imports: [TypeOrmModule.forFeature([AuditoryEntity])],
})
export class AuditoriesModule {}
