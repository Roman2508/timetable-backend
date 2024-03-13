import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { PlanSubjectEntity } from './entities/plan-subject.entity';
import { CreatePlanSubjectDto } from './dto/create-plan-subject.dto';
import { UpdatePlanSubjectNameDto } from './dto/update-plan-subject-name.dto';
import { UpdatePlanSubjectHoursDto } from './dto/update-plan-subject-hours.dto';
import { GroupLoadLessonsService } from 'src/group-load-lessons/group-load-lessons.service';

@Injectable()
export class PlanSubjectsService {
  constructor(
    @InjectRepository(PlanSubjectEntity)
    private repository: Repository<PlanSubjectEntity>,

    private groupLoadLessonsService: GroupLoadLessonsService,
  ) {}

  // Створення нової дисципліни в плані (лише ім'я та ЦК)
  async create(dto: CreatePlanSubjectDto) {
    // Шукаю чи є в плані дисципліни з таким ім'ям
    const planSubjects = await this.repository.find({
      where: { name: dto.name, plan: { id: dto.planId } },
    });

    // Якщо є - повертаю помилку
    if (planSubjects.length) {
      throw new BadRequestException('Назви дисциплін повинні бути унікальними');
    }

    // Якщо нема створюю нову дисципліну
    const payload = {
      name: dto.name,
      plan: { id: dto.planId },
      cmk: { id: dto.cmk },
    };

    const newSubject = this.repository.create(payload);

    return this.repository.save(newSubject);
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
      .set({ name: dto.newName, cmk: { id: dto.cmk } })
      .whereInIds(subjectsIds)
      .execute();

    const updatedSubjects = subjectsIds.map((el) => ({
      id: el,
      name: dto.newName,
      cmk: { id: dto.cmk },
    }));

    subjectsIds.map(async (id) => {
      await this.groupLoadLessonsService.updateName({
        oldName: dto.oldName,
        newName: dto.newName,
        planSubjectId: id,
        cmk: dto.cmk,
      });
    });

    return updatedSubjects;
  }

  // Створення або оновлення семестру для дисципліни
  async updateHours(id: number, dto: UpdatePlanSubjectHoursDto) {
    const subject = await this.repository.findOne({
      where: {
        plan: {
          id: dto.planId,
        },
        name: dto.name,
        semesterNumber: dto.semesterNumber,
      },
    });

    // Якщо дисципліни немає - її треба створити
    if (!subject) {
      const subjectDto = this.repository.create({
        ...dto,
        cmk: { id: dto.cmk },
        plan: { id: dto.planId },
      });

      const newSubject = await this.repository.save(subjectDto);

      await this.groupLoadLessonsService.updateHours({
        planSubject: newSubject,
        planId: dto.planId,
      });

      return newSubject;
    } else {
      // Якщо дисципліна є - треба оновити

      const updatedSubjects = { ...subject, ...dto, cmk: { id: dto.cmk } };

      await this.groupLoadLessonsService.updateHours({
        /* @ts-ignore */
        planSubject: updatedSubjects,
        planId: dto.planId,
      });

      /* @ts-ignore */
      return this.repository.save(updatedSubjects);
    }
  }

  // Створення або оновлення семестру для дисципліни
  // async updateHours(id: number, dto: UpdatePlanSubjectHoursDto) {
  //   const subject = await this.repository.findOne({ where: { id } });

  //   if (!subject) {
  //     throw new NotFoundException('Дисципліну не знайдено');
  //   }

  //   const updatedSubjects = { ...subject, ...dto };

  //   // let totalHours = 0;
  //   // const allLessonsNames = ['lectures', 'practical', 'laboratory', 'seminars'];,

  //   // for (const propName in updatedSubjects) {
  //   //   if (allLessonsNames.some((el) => propName === el)) {
  //   //     totalHours += updatedSubjects[propName];
  //   //   }
  //   // }

  //   await this.groupLoadLessonsService.updateHours({
  //     /* @ts-ignore */
  //     planSubject: updatedSubjects,
  //     planId: dto.planId,
  //   });

  //   /* @ts-ignore */
  //   return this.repository.save({ ...updatedSubjects /* , totalHours  */ });
  // }

  async remove(id: number) {
    const res = await this.repository.delete(id);

    if (res.affected === 0) {
      throw new NotFoundException('Групу не знайдено');
    }

    // Якщо я видаляю з плану дисципліну або семестр - видаляються також і всі group-load-lessons,
    // які були створені на основі цієї дисципліни
    await this.groupLoadLessonsService.removeByPlanId(id);

    return id;
  }
}
