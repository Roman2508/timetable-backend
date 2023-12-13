import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { TeacherCategoryEntity } from './entities/teacher-category.entity';
import { CreateTeacherCategoryDto } from './dto/create-teacher-category.dto';
import { UpdateTeacherCategoryDto } from './dto/update-teacher-category.dto';

@Injectable()
export class TeacherCategoriesService {
  constructor(
    @InjectRepository(TeacherCategoryEntity)
    private repository: Repository<TeacherCategoryEntity>,
  ) {}

  findAll() {
    return this.repository.find();
  }

  create(dto: CreateTeacherCategoryDto) {
    const newCategory = this.repository.create({ ...dto, teachers: [] });
    return this.repository.save(newCategory);
  }

  update(id: number, dto: UpdateTeacherCategoryDto) {
    const teacherCategory = 1

    return `This action updates a #${id} teacherCategory`;
  }

  // findOne(id: number) {
  //   return `This action returns a #${id} teacherCategory`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} teacherCategory`;
  // }
}
