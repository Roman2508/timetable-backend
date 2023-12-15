import { Repository } from 'typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';
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
    return this.repository.find({
      relations: {
        teachers: true,
      },
    });
  }

  create(dto: CreateTeacherCategoryDto) {
    const newCategory = this.repository.create({ ...dto, teachers: [] });
    return this.repository.save(newCategory);
  }

  async update(id: number, dto: UpdateTeacherCategoryDto) {
    const teacherCategory = await this.repository.findOne({
      where: { id },
      relations: {
        teachers: true,
      },
    });

    if (!teacherCategory) {
      throw new NotFoundException('Не знайдено');
    }

    return this.repository.save({ ...teacherCategory, name: dto.name });
  }

  async remove(id: number) {
    const res = await this.repository.delete(id);

    if (res.affected === 0) {
      throw new NotFoundException('Не знайдено');
    }

    return id;
  }
}
