import { Module } from '@nestjs/common';
import { TeacherCategoriesService } from './teacher-categories.service';
import { TeacherCategoriesController } from './teacher-categories.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeacherCategoryEntity } from './entities/teacher-category.entity';

@Module({
  controllers: [TeacherCategoriesController],
  providers: [TeacherCategoriesService],
  imports: [TypeOrmModule.forFeature([TeacherCategoryEntity])],
})
export class TeacherCategoriesModule {}
