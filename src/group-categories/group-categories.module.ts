import { Module } from '@nestjs/common';
import { GroupCategoriesService } from './group-categories.service';
import { GroupCategoriesController } from './group-categories.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroupCategoryEntity } from './entities/group-category.entity';

@Module({
  controllers: [GroupCategoriesController],
  providers: [GroupCategoriesService],
  imports: [TypeOrmModule.forFeature([GroupCategoryEntity])],
})
export class GroupCategoriesModule {}
