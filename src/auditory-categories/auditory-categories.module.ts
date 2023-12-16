import { Module } from '@nestjs/common';
import { AuditoryCategoriesService } from './auditory-categories.service';
import { AuditoryCategoriesController } from './auditory-categories.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditoryCategoryEntity } from './entities/auditory-category.entity';

@Module({
  controllers: [AuditoryCategoriesController],
  providers: [AuditoryCategoriesService],
  imports: [TypeOrmModule.forFeature([AuditoryCategoryEntity])],
})
export class AuditoryCategoriesModule {}
