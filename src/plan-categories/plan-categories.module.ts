import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PlanCategoriesService } from './plan-categories.service';
import { PlanCategoryEntity } from './entities/plan-category.entity';
import { PlanCategoriesController } from './plan-categories.controller';
import { PlanSubjectsModule } from 'src/plan-subjects/plan-subjects.module';

@Module({
  controllers: [PlanCategoriesController],
  providers: [PlanCategoriesService],
  imports: [TypeOrmModule.forFeature([PlanCategoryEntity]), PlanSubjectsModule],
})
export class PlanCategoriesModule {}
