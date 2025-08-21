import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { TeacherCategoriesService } from './teacher-categories.service'
import { TeacherCategoryEntity } from './entities/teacher-category.entity'
import { TeacherCategoriesController } from './teacher-categories.controller'

@Module({
  controllers: [TeacherCategoriesController],
  providers: [TeacherCategoriesService],
  imports: [TypeOrmModule.forFeature([TeacherCategoryEntity])],
  exports: [TeacherCategoriesService],
})
export class TeacherCategoriesModule {}
