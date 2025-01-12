import { createQueryBuilder, getRepository, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';

import { GroupEntity } from './entities/group.entity';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { GradeBookService } from 'src/grade-book/grade-book.service';
import { GoogleCalendarService } from 'src/google-calendar/google-calendar.service';
import { CreateGroupSpecializationDto } from './dto/create-group-specialization.dto';
import { UpdateGroupSpecializationDto } from './dto/update-group-specialization.dto';
import { GroupLoadLessonsService } from './../group-load-lessons/group-load-lessons.service';

@Injectable()
export class GroupsService {
  constructor(
    @InjectRepository(GroupEntity)
    private groupsRepository: Repository<GroupEntity>,

    private gradeBookRepository: GradeBookService,

    private groupLoadLessonsService: GroupLoadLessonsService,

    private readonly googleCalendarService: GoogleCalendarService,
  ) {}

  async findOne(id: number) {
    const group = await this.groupsRepository.findOne({
      where: { id },
      relations: {
        category: true,
        stream: true,
        educationPlan: true,
        students: true,
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
        students: { id: true, name: true, status: true },
        groupLoad: {
          id: true,
          name: true,
          semester: true,
          specialization: true,
          typeRu: true,
          typeEn: true,
          hours: true,
          subgroupNumber: true,
          group: { id: true, name: true },
          planSubjectId: { id: true },
          plan: { id: true },
          stream: {
            id: true,
            name: true,
            groups: { id: true, name: true },
            // lessons: { id: true, name: true },
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
    const students = group.students.filter((el) => el.status === 'Навчається');
    return { ...group, students };
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
      // calendarId: 'https://calendar.google.com',
      calendarId,
    });

    const group = await this.groupsRepository.save(newGroup);

    // Коли створюється нова група і до неї вперше прикріплюється навч.план - створюю для всіх дисциплін плану group-load-lessons
    const groupLoadLessons = await this.groupLoadLessonsService.createAll({
      groupId: newGroup.id,
      educationPlanId: educationPlan,
      students: 0,
    });

    // Create grade book for all lessons (without exams, consultation and methodological guidance)
    await this.gradeBookRepository.createAll({
      groupId: newGroup.id,
      // @ts-ignore
      groupLoadLessons,
    });

    return group;
  }

  async update(id: number, dto: UpdateGroupDto) {
    const group = await this.groupsRepository.findOne({
      where: { id },
      relations: { educationPlan: true, students: true },
    });

    if (!group) throw new NotFoundException('Групу не знайдено');

    const oldEducationPlanId = Number(group.educationPlan.id);
    const newEducationPlanId = Number(dto.educationPlan);

    // Якщо при оновленні було змінено навчальний план
    // потрібно видалити всі старі group-load-lessons які були в цієї групи та створити нові
    if (oldEducationPlanId !== newEducationPlanId) {
      const removeGroupLoadRes = await this.groupLoadLessonsService.removeByGroupId(group.id);
      const removeGradeBooksRes = await this.gradeBookRepository.deleteAll(group.id);

      if (!removeGroupLoadRes) return;
      const groupLoadLessons = await this.groupLoadLessonsService.createAll({
        groupId: group.id,
        educationPlanId: newEducationPlanId,
        students: group.students?.length || 0,
      });

      if (!removeGradeBooksRes) return;
      await this.gradeBookRepository.createAll({
        groupId: group.id,
        // @ts-ignore
        groupLoadLessons,
      });
    }

    // Якщо при оновленні було змінено кількість студентів
    // if (Number(group.students) !== Number(dto.students)) {
    //   await this.groupLoadLessonsService.changeAllStudentsCount({
    //     id,
    //     students: dto.students,
    //   });
    // }

    const { category, educationPlan, ...rest } = dto;

    return this.groupsRepository.save({
      ...group,
      ...rest,
      category: { id: category },
      educationPlan: { id: educationPlan },
    });
  }

  async incrementAllGroupsCourse() {
    const allGroups = await this.groupsRepository.find({
      where: { isHide: false },
      relations: { category: true },
      select: { category: { id: true } },
    });

    const updatedGroups = Promise.all(
      allGroups.map(async (el) => {
        return await this.groupsRepository.save({ ...el, courseNumber: el.courseNumber + 1 });
      }),
    );

    return updatedGroups;
  }

  async decrementAllGroupsCourse() {
    const allGroups = await this.groupsRepository.find({
      where: { isHide: false },
      relations: { category: true },
      select: { category: { id: true } },
    });

    const updatedGroups = Promise.all(
      allGroups.map(async (el) => {
        return await this.groupsRepository.save({ ...el, courseNumber: el.courseNumber - 1 });
      }),
    );

    return updatedGroups;
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

  async handleGroupVisible(id: number) {
    const group = await this.groupsRepository.findOne({
      where: { id },
      relations: { educationPlan: true },
    });

    if (!group) throw new NotFoundException('Групу не знайдено');

    await this.groupsRepository.save({ ...group, isHide: !group.isHide });

    return { id, isHide: !group.isHide };
  }

  // Specialization
  async createSpecialization(dto: CreateGroupSpecializationDto) {
    const group = await this.groupsRepository.findOne({
      where: { id: dto.groupId },
    });

    if (!group) throw new NotFoundException('Групу не знайдено');

    const isSpecializationExist = group.specializationList.find((el) => el === dto.name);

    if (isSpecializationExist) throw new BadRequestException('Назви спец. підгруп повинні бути унікальними');

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

    const specializationList = group.specializationList.filter((el) => el !== name);

    await this.groupsRepository.save({
      ...group,
      specializationList,
    });

    return specializationList;
  }
}
