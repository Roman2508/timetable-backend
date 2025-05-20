import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';

import { GroupCategoryEntity } from './entities/group-category.entity';
import { CreateGroupCategoryDto } from './dto/create-group-category.dto';
import { UpdateGroupCategoryDto } from './dto/update-group-category.dto';

@Injectable()
export class GroupCategoriesService {
  constructor(
    @InjectRepository(GroupCategoryEntity)
    private repository: Repository<GroupCategoryEntity>,
  ) {}

  async findAll() {
    return this.repository.find({
      relations: { groups: { category: true, students: true } },
      select: {
        groups: {
          id: true,
          name: true,
          isHide: true,
          status: true,
          students: { id: true },
          courseNumber: true,
          yearOfAdmission: true,
          formOfEducation: true,
          category: { id: true, name: true },
        },
      },
    });
  }

  create(dto: CreateGroupCategoryDto) {
    const groupsCategory = this.repository.create({
      shortName: dto.shortName,
      name: dto.name,
      groups: [],
    });
    return this.repository.save(groupsCategory);
  }

  async update(id: number, dto: UpdateGroupCategoryDto) {
    const groupsCategory = await this.repository.findOne({
      where: { id },
      // relations: { groups: { students: true } },
      // select: {
      //   groups: {
      //     id: true,
      //     name: true,
      //     students: { id: true },
      //     courseNumber: true,
      //   },
      // },
    });

    if (!groupsCategory) {
      throw new NotFoundException('Категорія не знайдена');
    }

    return this.repository.save({ ...groupsCategory, name: dto.name, shortName: dto.shortName });
  }

  async remove(id: number) {
    const res = await this.repository.delete(id);

    if (res.affected === 0) {
      throw new NotFoundException('Не знайдено');
    }

    return id;
  }
}
