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

  create(dto: CreatePlanSubjectDto) {
    const newSubject = {
      ...dto,
      plan: { id: dto.planId },
    };

    console.log(newSubject, 'plan-subject.service.ts');

    const subject = this.repository.create(newSubject);

    return this.repository.save(subject);
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
