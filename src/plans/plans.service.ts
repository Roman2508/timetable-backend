import { Injectable } from '@nestjs/common';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { PlanEntity } from './entities/plan.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PlansService {
  constructor(
    @InjectRepository(PlanEntity)
    private repository: Repository<PlanEntity>,
  ) {}

  create(createPlanDto: CreatePlanDto) {
    return 'This action adds a new plan';
  }

  findAll() {
    return `This action returns all plans`;
  }

  findOne(id: number) {
    return `This action returns a #${id} plan`;
  }

  update(id: number, updatePlanDto: UpdatePlanDto) {
    return `This action updates a #${id} plan`;
  }

  remove(id: number) {
    return `This action removes a #${id} plan`;
  }
}
