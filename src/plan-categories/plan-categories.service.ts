import { Repository } from 'typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreatePlanCategoryDto } from './dto/create-plan-category.dto';
import { UpdatePlanCategoryDto } from './dto/update-plan-category.dto';
import { PlanCategoryEntity } from './entities/plan-category.entity';

@Injectable()
export class PlanCategoriesService {
  constructor(
    @InjectRepository(PlanCategoryEntity)
    private repository: Repository<PlanCategoryEntity>,
  ) {}

  findAll() {
    return this.repository.find({
      relations: {
        plans: true,
      },
    });
  }

  create(dto: CreatePlanCategoryDto) {
    const newCategory = { name: dto.name, plans: [] };

    const plansCategory = this.repository.create(newCategory);
    return this.repository.save(plansCategory);
  }

  async update(id: number, dto: UpdatePlanCategoryDto) {
    const planCategory = await this.repository.findBy({ id });

    if (!planCategory[0]) {
      throw new NotFoundException('Категорія не знайдена');
    }

    return this.repository.save({ ...planCategory[0], ...dto });
  }

  async remove(id: number) {
    const res = await this.repository.delete(id);

    if (res.affected === 0) {
      throw new NotFoundException('Не знайдено');
    }

    return id;
  }
}
