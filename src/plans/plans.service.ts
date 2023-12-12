import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
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

  findAll() {
    return `This action returns all plans`;
  }

  // findOne(id: number) {
  //   return `This action returns a #${id} plan`;
  // }

  // update(id: number, updatePlanDto: UpdatePlanDto) {
  //   return `This action updates a #${id} plan`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} plan`;
  // }
}
