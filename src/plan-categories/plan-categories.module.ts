import { Module } from '@nestjs/common';
import { PlanCategoriesService } from './plan-categories.service';
import { PlanCategoriesController } from './plan-categories.controller';
import { PlanCategoryEntity } from './entities/plan-category.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  controllers: [PlanCategoriesController],
  providers: [PlanCategoriesService],
  imports: [TypeOrmModule.forFeature([PlanCategoryEntity])],
})
export class PlanCategoriesModule {}
