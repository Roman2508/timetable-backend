import { Injectable } from '@nestjs/common';
import { CreatePlanSubjectDto } from './dto/create-plan-subject.dto';
import { UpdatePlanSubjectDto } from './dto/update-plan-subject.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { PlanSubjectEntity } from './entities/plan-subject.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PlanSubjectsService {
  constructor(
    @InjectRepository(PlanSubjectEntity)
    private repository: Repository<PlanSubjectEntity>,
  ) {}

  create(createPlanSubjectDto: CreatePlanSubjectDto) {
    return 'This action adds a new planSubject';
  }

  // findAll() {
  //   return this.repository.find;
  // }

  async findOne(id: number) {
    return this.repository.findOneBy({ id });
  }

  update(id: number, updatePlanSubjectDto: UpdatePlanSubjectDto) {
    return `This action updates a #${id} planSubject`;
  }

  remove(id: number) {
    return this.repository.delete({ id });
  }
}
