import { Repository } from 'typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PlanEntity } from './entities/plan.entity';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';

@Injectable()
export class PlansService {
  constructor(
    @InjectRepository(PlanEntity)
    private repository: Repository<PlanEntity>,
  ) {}

  create(dto: CreatePlanDto) {
    const newPlan = {
      name: dto.name,
      category: { id: +dto.categoryId },
      subjects: [],
    };

    const plan = this.repository.create(newPlan);
    return this.repository.save(plan);
  }

  findOne(id: number) {
    return this.repository.find({
      where: { id },
      relations: { subjects: true },
    });
  }

  async update(id: number, dto: UpdatePlanDto) {
    const plan = await this.repository.findOne({
      where: { id },
      relations: { category: true },
      select: { category: { id: true, name: true } },
    });

    if (!plan) {
      throw new NotFoundException('План не знайдено');
    }

    return this.repository.save({ ...plan, ...dto });
  }

  async remove(id: number) {
    const res = await this.repository.delete(id);

    if (res.affected === 0) {
      throw new NotFoundException('Не знайдено');
    }

    return id;
  }
}

// async findAll() {
// return this.repository.find({
//   relations: {
//     category: true,
//   },
// });
// const qb = await this.repository
// .createQueryBuilder('plan')
// .select(['plan.id', 'plan.name'])
// .leftJoin('plan.category', 'category')
// .getMany();
// return qb;
// }
