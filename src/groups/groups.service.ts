import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { GroupEntity } from './entities/group.entity';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { GoogleCalendarService } from 'src/google-calendar/google-calendar.service';
import { CreateGroupSpecializationDto } from './dto/create-group-specialization.dto';
import { UpdateGroupSpecializationDto } from './dto/update-group-specialization.dto';
import { GroupLoadLessonsService } from './../group-load-lessons/group-load-lessons.service';

@Injectable()
export class GroupsService {
  constructor(
    private readonly googleCalendarService: GoogleCalendarService,

    @InjectRepository(GroupEntity)
    private groupsRepository: Repository<GroupEntity>,

    private groupLoadLessonsService: GroupLoadLessonsService,
  ) {}

  async findOne(id: number) {
    const group = await this.groupsRepository.findOne({
      where: { id },
      relations: {
        category: true,
        stream: true,
        educationPlan: true,
        groupLoad: {
          group: true,
          planSubjectId: true,
          plan: true,
          stream: true,
          cmk: true,
          teacher: true,
        },
      },
      select: {
        category: { id: true, name: true },
        educationPlan: { id: true, name: true },
        groupLoad: {
          id: true,
          name: true,
          semester: true,
          specialization: true,
          typeRu: true,
          typeEn: true,
          hours: true,
          subgroupNumber: true,
          students: true,
          group: { id: true, name: true },
          planSubjectId: { id: true },
          plan: { id: true },
          stream: {
            id: true,
            name: true,
            groups: { id: true, name: true },
            lessons: { id: true, name: true },
          },
          teacher: {
            id: true,
            firstName: true,
            middleName: true,
            lastName: true,
          },
          cmk: { id: true },
        },
      },
    });

    if (!group) throw new NotFoundException('Групу не знайдено');
    return group;
  }

  async create(dto: CreateGroupDto) {
    const { category, educationPlan, ...rest } = dto;

    const calendarId = await this.googleCalendarService.createCalendar({
      owner: dto.name,
    });

    const newGroup = this.groupsRepository.create({
      ...rest,
      educationPlan: { id: educationPlan },
      category: { id: category },
      calendarId,
    });

    const group = await this.groupsRepository.save(newGroup);

    // Коли створюється нова група і до неї вперше прикріплюється навч.план - створюю для всіх дисциплін плану group-load-lessons
    await this.groupLoadLessonsService.createAll({
      groupId: newGroup.id,
      educationPlanId: educationPlan,
      students: newGroup.students,
    });

    return group;
  }

  async update(id: number, dto: UpdateGroupDto) {
    const group = await this.groupsRepository.findOne({
      where: { id },
      relations: { educationPlan: true },
    });

    if (!group) throw new NotFoundException('Групу не знайдено');

    const oldEducationPlanId = Number(group.educationPlan.id);
    const newEducationPlanId = Number(dto.educationPlan);

    // Якщо при оновленні було змінено навчальний план
    // потрібно видалити всі старі group-load-lessons які були в цієї групи та створити нові
    if (oldEducationPlanId !== newEducationPlanId) {
      const removeRes = await this.groupLoadLessonsService.removeByGroupId(
        group.id,
      );

      if (removeRes) {
        await this.groupLoadLessonsService.createAll({
          groupId: group.id,
          educationPlanId: newEducationPlanId,
          students: dto.students,
        });
      }
    }

    const { category, educationPlan, ...rest } = dto;

    return this.groupsRepository.save({
      ...group,
      ...rest,
      category: { id: category },
      educationPlan: { id: educationPlan },
    });
  }

  // Коли видаляється група - видаляються такод всі group-load-lessons які були в цієї групи
  async remove(id: number) {
    const res = await this.groupsRepository.delete(id);

    if (res.affected === 0) {
      throw new NotFoundException('Групу не знайдено');
    }

    await this.groupLoadLessonsService.removeByGroupId(id);

    return id;
  }

  // Specialization
  async createSpecialization(dto: CreateGroupSpecializationDto) {
    const group = await this.groupsRepository.findOne({
      where: { id: dto.groupId },
    });

    if (!group) throw new NotFoundException('Групу не знайдено');

    const isSpecializationExist = group.specializationList.find(
      (el) => el === dto.name,
    );

    if (isSpecializationExist)
      throw new BadRequestException(
        'Назви спец. підгруп повинні бути унікальними',
      );

    await this.groupsRepository.save({
      ...group,
      specializationList: [...group.specializationList, dto.name],
    });

    return [...group.specializationList, dto.name];
  }

  async updateSpecialization(dto: UpdateGroupSpecializationDto) {
    const group = await this.groupsRepository.findOne({
      where: { id: dto.groupId },
    });

    if (!group) throw new NotFoundException('Групу не знайдено');

    const specializationList = group.specializationList.map((el) => {
      if (el === dto.oldName) return dto.newName;
      else return el;
    });

    await this.groupsRepository.save({
      ...group,
      specializationList,
    });

    return specializationList;
  }

  async deleteSpecialization(id: number, name: string) {
    const group = await this.groupsRepository.findOne({
      where: { id: id },
    });

    if (!group) throw new NotFoundException('Групу не знайдено');

    const specializationList = group.specializationList.filter(
      (el) => el !== name,
    );

    await this.groupsRepository.save({
      ...group,
      specializationList,
    });

    return specializationList;
  }
}

// const selectedPlanSubjects = await this.planSubjectsRepository.find({
//   where: { plan: { id: dto.educationPlan } },
// });

// const groupLoadLessons = [];

// selectedPlanSubjects.forEach((el) => {
//   const subjectTypes = [
//     { name: 'lectures', alias: { ru: 'ЛК', en: 'lectures' } },
//     { name: 'practical', alias: { ru: 'ПЗ', en: 'practical' } },
//     { name: 'laboratory', alias: { ru: 'ЛАБ', en: 'laboratory' } },
//     { name: 'seminars', alias: { ru: 'СЕМ', en: 'seminars' } },
//     { name: 'exams', alias: { ru: 'ЕКЗ', en: 'exams' } },
//     { name: 'lectures', alias: { ru: '', en: '' } },
//   ];

//   for (let key in el) {
//     const findedSubjectType = subjectTypes.find((el) => el.name === key);

//     if (findedSubjectType) {
//       //
//       const newLesson = {
//         name: el.name,
//         group: newGroup.id,
//         semester: el.semesterNumber,
//         specialization: null,
//         typeRu: findedSubjectType.alias.ru,
//         typeEn: findedSubjectType.alias.en,
//         hours: el[key],
//         teacher: null,
//         stream: null,
//         subgroupNumber: null,
//         students: null,
//       };
//       //
//       groupLoadLessons.push(newLesson);
//     }
//   }
// });
