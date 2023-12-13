import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';

import { PlanSubjectEntity } from './entities/plan-subject.entity';
import { CreatePlanSubjectDto } from './dto/create-plan-subject.dto';
import { UpdatePlanSubjectHoursDto } from './dto/update-plan-subject-hours.dto';
import { UpdatePlanSubjectNameDto } from './dto/update-plan-subject-name.dto';

@Injectable()
export class PlanSubjectsService {
  constructor(
    @InjectRepository(PlanSubjectEntity)
    private repository: Repository<PlanSubjectEntity>,
  ) {}

  create(dto: CreatePlanSubjectDto) {
    const newSubject = {
      name: dto.name,
      plan: { id: dto.planId },
    };

    const subject = this.repository.create(newSubject);

    return this.repository.save(subject);
  }

  async findOne(id: number) {
    return this.repository.findOneBy({ id });
  }

  async updateName(id: number, dto: UpdatePlanSubjectNameDto) {
    // find all subjects by plan id
    const subject = await this.repository.find({
      where: { plan: { id }, name: dto.oldName },
    });

    if (!subject.length) {
      throw new NotFoundException('Дисципліну не знайдено');
    }

    // select all ids in updating subjects
    const subjectsIds = subject.map((el) => el.id);

    // update all subjects by id
    await this.repository
      .createQueryBuilder('updateSubjects')
      .update(PlanSubjectEntity)
      .set({ name: dto.newName })
      .whereInIds(subjectsIds)
      .execute();

    const updatedSubjects = subjectsIds.map((el) => ({
      id: el,
      name: dto.newName,
    }));

    return updatedSubjects;
  }

  async updateHours(id: number, dto: UpdatePlanSubjectHoursDto) {
    const subject = await this.repository.find({ where: { id } });

    if (!subject[0]) {
      throw new NotFoundException('Дисципліну не знайдено');
    }

    const updatedSubjects = { ...subject[0], ...dto };

    let totalHours = 0;
    const allLessonsNames = ['lectures', 'practical', 'laboratory', 'seminars'];

    for (const propName in updatedSubjects) {
      if (allLessonsNames.some((el) => propName === el)) {
        totalHours += updatedSubjects[propName];
      }
    }

    return this.repository.save({ ...updatedSubjects, totalHours });
  }

  remove(id: number) {
    this.repository.delete({ id });
    return id;
  }
}
