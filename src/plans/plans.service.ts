import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { PlanEntity } from './entities/plan.entity';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

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
    return this.repository.findOne({
      where: { id },
      select: { category: { id: true } },
      relations: { category: true },
    });
    // return this.repository.findOne({
    //   where: { id },
    //   select: { category: { id: true }, subjects: true },
    //   relations: { subjects: { plan: true, cmk: true }, category: true },
    // });
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
    const plan = await this.repository.findOne({
      where: { id },
      relations: { subjects: true },
      select: { subjects: { id: true } },
    });

    if (!plan) throw new NotFoundException('План не знайдено');

    if (plan.subjects.length) throw new BadRequestException('Не можливо видалити план в якому є дисципліни');

    const res = await this.repository.delete(id);

    if (res.affected === 0) throw new NotFoundException('План не знайдено');

    return id;
  }
}
