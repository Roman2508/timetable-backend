import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Repository } from 'typeorm';
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
        teachers: { category: true, user: true },
      },
      select: {
        id: true,
        name: true,
        shortName: true,
        teachers: {
          id: true,
          firstName: true,
          middleName: true,
          lastName: true,
          calendarId: true,
          status: true,
          isHide: true,
          user: { id: true, email: true, lastLogin: true },
          category: { id: true, name: true, shortName: true },
        },
      },
    });
  }

  create(dto: CreateTeacherCategoryDto) {
    const newCategory = this.repository.create({ ...dto, teachers: [] });
    return this.repository.save(newCategory);
  }

  async update(id: number, dto: UpdateTeacherCategoryDto) {
    const teacherCategory = await this.repository.findOne({ where: { id } });
    // const teacherCategory = await this.repository.findOne({ where: { id }, relations: { teachers: true } });

    if (!teacherCategory) {
      throw new NotFoundException('Не знайдено');
    }
    console.log('dto', dto);
    return this.repository.save({ ...teacherCategory, name: dto.name, shortName: dto.shortName });
  }

  async remove(id: number) {
    const category = await this.repository.findOne({
      where: { id },
      relations: { teachers: true },
    });

    if (category.teachers.length > 0) {
      throw new BadRequestException('Не можна видалити категорію в якій є викладачi');
    }

    const res = await this.repository.delete(id);

    if (res.affected === 0) {
      throw new NotFoundException('Не знайдено');
    }

    return id;
  }
}
