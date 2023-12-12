import { Injectable } from '@nestjs/common';
import { CreatePlanCategoryDto } from './dto/create-plan-category.dto';
import { UpdatePlanCategoryDto } from './dto/update-plan-category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { PlanCategoryEntity } from './entities/plan-category.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PlanCategoriesService {
  constructor(
    @InjectRepository(PlanCategoryEntity)
    private repository: Repository<PlanCategoryEntity>,
  ) {}

  findAll() {
    return this.repository.find();
  }

  create(createPlanCategoryDto: CreatePlanCategoryDto) {
    return this.repository.create(createPlanCategoryDto);
  }

  // findOne(id: number) {
  //   return `This action returns a #${id} planCategory`;
  // }

  update(id: number, updatePlanCategoryDto: UpdatePlanCategoryDto) {
    return `This action updates a #${id} planCategory`;
  }

  remove(id: number) {
    return `This action removes a #${id} planCategory`;
  }
}
