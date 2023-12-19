import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PlanSubjectEntity } from './entities/plan-subject.entity';
import { CreatePlanSubjectDto } from './dto/create-plan-subject.dto';
import { UpdatePlanSubjectHoursDto } from './dto/update-plan-subject-hours.dto';
import { UpdatePlanSubjectNameDto } from './dto/update-plan-subject-name.dto';
import { GroupLoadLessonsService } from 'src/group-load-lessons/group-load-lessons.service';

@Injectable()
export class PlanSubjectsService {
  constructor(
    @InjectRepository(PlanSubjectEntity)
    private repository: Repository<PlanSubjectEntity>,

    private groupLoadLessonsService: GroupLoadLessonsService,
  ) {}

  async create(dto: CreatePlanSubjectDto) {
    // Шукаю чи є в плані дисципліни з таким ім'ям
    const planSubjects = await this.repository.find({
      where: { name: dto.name, plan: { id: dto.planId } },
    });

    // Якщо є - повертаю помилку
    if (planSubjects.length) {
      throw new ForbiddenException('Назви дисциплін повинні бути унікальними');
    }

    // Якщо нема створюю нову дисципліну
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

  async updateName(dto: UpdatePlanSubjectNameDto) {
    // find all subjects by plan id
    const subject = await this.repository.find({
      where: { plan: { id: dto.planId }, name: dto.oldName },
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

    subjectsIds.map(async (id) => {
      await this.groupLoadLessonsService.updateName({
        oldName: dto.oldName,
        newName: dto.newName,
        planSubjectId: id,
      });
    });

    return updatedSubjects;
  }

  async updateHours(id: number, dto: UpdatePlanSubjectHoursDto) {
    const subject = await this.repository.findOne({ where: { id } });

    if (!subject) {
      throw new NotFoundException('Дисципліну не знайдено');
    }

    const updatedSubjects = { ...subject, ...dto };

    // let totalHours = 0;
    // const allLessonsNames = ['lectures', 'practical', 'laboratory', 'seminars'];

    // for (const propName in updatedSubjects) {
    //   if (allLessonsNames.some((el) => propName === el)) {
    //     totalHours += updatedSubjects[propName];
    //   }
    // }

    // update load lessons => subject, dto.planId, groupId???, students???

    await this.groupLoadLessonsService.updateHours({
      planSubject: updatedSubjects,
    });

    // return this.repository.save({ ...updatedSubjects, totalHours });
    return;
  }

  remove(id: number) {
    this.repository.delete({ id });
    return id;
  }
}
