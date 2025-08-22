import { Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import { Injectable, NotFoundException } from '@nestjs/common'

import { PlanCategoryEntity } from './entities/plan-category.entity'
import { CreatePlanCategoryDto } from './dto/create-plan-category.dto'
import { UpdatePlanCategoryDto } from './dto/update-plan-category.dto'
import { PlanSubjectsService } from 'src/plan-subjects/plan-subjects.service'

@Injectable()
export class PlanCategoriesService {
  constructor(
    @InjectRepository(PlanCategoryEntity)
    private repository: Repository<PlanCategoryEntity>,

    private planSubjectsService: PlanSubjectsService,
  ) {}

  async findAll() {
    const planCategories = await this.repository.find({
      relations: { plans: { category: true } },
      select: {
        id: true,
        name: true,
        plans: {
          id: true,
          name: true,
          status: true,
          category: { id: true, name: true },
        },
      },
    })

    return Promise.all(
      planCategories.map(async (category) => {
        const plans = category.plans.map(async (plan) => {
          const subjects = await this.planSubjectsService.findAll(plan.id, '1,2,3,4,5,6,7,8')
          return { ...plan, subjectsCount: subjects.length }
        })
        return { ...category, plans: await Promise.all(plans) }
      }),
    )
  }

  create(dto: CreatePlanCategoryDto) {
    const newCategory = { name: dto.name, plans: [] }

    const plansCategory = this.repository.create(newCategory)
    return this.repository.save(plansCategory)
  }

  async update(id: number, dto: UpdatePlanCategoryDto) {
    const planCategory = await this.repository.findBy({ id })

    if (!planCategory[0]) {
      throw new NotFoundException('Категорія не знайдена')
    }

    return this.repository.save({ ...planCategory[0], ...dto })
  }

  async remove(id: number) {
    const res = await this.repository.delete(id)

    if (res.affected === 0) {
      throw new NotFoundException('Не знайдено')
    }

    return id
  }
}
