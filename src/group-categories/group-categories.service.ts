import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateGroupCategoryDto } from './dto/create-group-category.dto';
import { UpdateGroupCategoryDto } from './dto/update-group-category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { GroupCategoryEntity } from './entities/group-category.entity';
import { Repository } from 'typeorm';

@Injectable()
export class GroupCategoriesService {
  constructor(
    @InjectRepository(GroupCategoryEntity)
    private repository: Repository<GroupCategoryEntity>,
  ) {}

  findAll(isHide: 'false' | 'true') {
    const visible = isHide === 'false' ? false : true;

    return this.repository.find({
      where: { groups: { isHide: visible } },
      relations: {
        groups: { category: true, students: true },
      },
      select: {
        groups: {
          id: true,
          name: true,
          isHide: true,
          students: { id: true },
          courseNumber: true,
          yearOfAdmission: true,
          category: { id: true, name: true },
        },
      },
    });
  }

  create(dto: CreateGroupCategoryDto) {
    const groupsCategory = this.repository.create({
      name: dto.name,
      groups: [],
    });
    return this.repository.save(groupsCategory);
  }

  async update(id: number, dto: UpdateGroupCategoryDto) {
    const groupsCategory = await this.repository.findOne({
      where: { id },
      relations: { groups: true },
      select: {
        groups: {
          id: true,
          name: true,
          students: true,
          courseNumber: true,
        },
      },
    });

    if (!groupsCategory) {
      throw new NotFoundException('Категорія не знайдена');
    }

    return this.repository.save({ ...groupsCategory, name: dto.name });
  }

  async remove(id: number) {
    const res = await this.repository.delete(id);

    if (res.affected === 0) {
      throw new NotFoundException('Не знайдено');
    }

    return id;
  }
}
