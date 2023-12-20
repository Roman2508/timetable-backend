import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { DeepPartial, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { GroupEntity } from 'src/groups/entities/group.entity';
import { GroupLoadLessonEntity } from './entities/group-load-lesson.entity';
import { CreateGroupLoadLessonDto } from './dto/create-group-load-lesson.dto';
import { PlanSubjectEntity } from 'src/plan-subjects/entities/plan-subject.entity';
import { UpdateGroupLoadLessonNameDto } from './dto/update-group-load-lesson-name.dto';
import { UpdateGroupLoadLessonHoursDto } from './dto/update-group-load-lesson-hours.dto';

@Injectable()
export class GroupLoadLessonsService {
  constructor(
    @InjectRepository(GroupLoadLessonEntity)
    private groupLoadLessonsRepository: Repository<GroupLoadLessonEntity>,

    @InjectRepository(PlanSubjectEntity)
    private planSubjectsRepository: Repository<PlanSubjectEntity>,

    @InjectRepository(GroupEntity)
    private groupRepository: Repository<GroupEntity>,
  ) {}

  // Конвертує дисципліну навчального плану в масив group-load-lessons
  convertPlanSubjectsToGroupLoadLessons(
    planSubjects: PlanSubjectEntity[],
    groupId: number,
    planId: number,
    students: number,
  ) {
    const groupLoadLessons: DeepPartial<GroupLoadLessonEntity>[] = [];

    const subjectTypes = [
      { name: 'lectures', alias: { ru: 'ЛК', en: 'lectures' } },
      { name: 'practical', alias: { ru: 'ПЗ', en: 'practical' } },
      { name: 'laboratory', alias: { ru: 'ЛАБ', en: 'laboratory' } },
      { name: 'seminars', alias: { ru: 'СЕМ', en: 'seminars' } },
      { name: 'exams', alias: { ru: 'ЕКЗ', en: 'exams' } },
      {
        name: 'examsConsulation',
        alias: { ru: 'КОНС', en: 'examsConsulation' },
      },
      {
        name: 'metodologicalGuidance',
        alias: { ru: 'МЕТОД', en: 'metodologicalGuidance' },
      },
    ];

    planSubjects.map(async (lesson) => {
      for (let key in lesson) {
        const findedSubjectType = subjectTypes.find(
          (type) => type.name === key,
        );

        // Якщо дисципліну знайдено (за типом) і кількість годин !== 0 - створюю group-load-lesson
        if (findedSubjectType && lesson[findedSubjectType?.name] !== 0) {
          const payload = {
            name: lesson.name,
            group: { id: groupId },
            plan: { id: planId },
            planSubjectId: { id: lesson.id },
            semester: lesson.semesterNumber,
            specialization: null,
            typeRu: findedSubjectType.alias.ru,
            typeEn: findedSubjectType.alias.en,
            hours: lesson[key],
            teacher: null,
            stream: null,
            subgroupNumber: null,
            students: students,
          };

          // ???
          groupLoadLessons.push(payload);

          // const newLesson = this.groupLoadLessonsRepository.create(payload);

          // groupLoadLessons.push(
          //   await this.groupLoadLessonsRepository.save(newLesson),
          // );
        }
      }
    });

    return groupLoadLessons;
  }

  // Коли при створенні групи для неї вперше прикріплюється навчальний план - створюю для всіх дисциплін плану group-load-lessons
  // Або коли для групи прикріплюється інший (відмінний від попереднього) план
  // Треба споатку видалити всі group-load-lessons старого плану (за це відповідає this.removeAll())
  // Потім створити всі нові group-load-lessons для нового плану (за це відповідає this.createAll())
  async createAll(dto: CreateGroupLoadLessonDto) {
    try {
      // Шукаю всі дисципліни в навчальному плані
      const selectedPlanSubjects = await this.planSubjectsRepository.find({
        where: { plan: { id: dto.educationPlanId } },
      });

      if (!selectedPlanSubjects.length) {
        throw new NotFoundException('Навчальний план не знайдено');
      }

      // const groupLoadLessons: GroupLoadLessonEntity[] = [];

      // const subjectTypes = [
      //   { name: 'lectures', alias: { ru: 'ЛК', en: 'lectures' } },
      //   { name: 'practical', alias: { ru: 'ПЗ', en: 'practical' } },
      //   { name: 'laboratory', alias: { ru: 'ЛАБ', en: 'laboratory' } },
      //   { name: 'seminars', alias: { ru: 'СЕМ', en: 'seminars' } },
      //   { name: 'exams', alias: { ru: 'ЕКЗ', en: 'exams' } },
      // ];

      // selectedPlanSubjects.map(async (lesson) => {
      //   for (let key in lesson) {
      //     const findedSubjectType = subjectTypes.find(
      //       (type) => type.name === key,
      //     );

      //     // Якщо дисципліну знайдено (за типом) і кількість годин !== 0 - створюю group-load-lesson
      //     if (findedSubjectType && lesson[findedSubjectType?.name] !== 0) {
      //       const payload = {
      //         name: lesson.name,
      //         group: { id: dto.groupId },
      //         plan: { id: dto.educationPlanId },
      //         planSubjectId: { id: lesson.id },
      //         semester: lesson.semesterNumber,
      //         specialization: null,
      //         typeRu: findedSubjectType.alias.ru,
      //         typeEn: findedSubjectType.alias.en,
      //         hours: lesson[key],
      //         teacher: null,
      //         stream: null,
      //         subgroupNumber: null,
      //         students: dto.students,
      //       };

      //       const newLesson = this.groupLoadLessonsRepository.create(payload);

      //       groupLoadLessons.push(
      //         await this.groupLoadLessonsRepository.save(newLesson),
      //       );
      //     }
      //   }
      // });

      const newLessons = this.convertPlanSubjectsToGroupLoadLessons(
        selectedPlanSubjects,
        dto.groupId,
        dto.educationPlanId,
        dto.students,
      );

      const groupLoadLessons = newLessons.map(
        async (el: DeepPartial<GroupLoadLessonEntity>) => {
          const newLesson = this.groupLoadLessonsRepository.create(el);

          await this.groupLoadLessonsRepository.save(newLesson);
        },
      );

      return groupLoadLessons;
    } catch (err) {
      console.log(err.message);
      throw new BadRequestException('Помилка при створенні навантаження групи');
    }
  }

  async findAllByGroupId(groupId: number) {
    const lessons = await this.groupLoadLessonsRepository.find({
      where: { group: { id: groupId } },
    });

    if (!lessons.length) throw new NotFoundException('Дисципліни не знайдені');

    return lessons;
  }

  // Навантаження, що йде на розклад (без консультацій до екзамену та метод. керівництва)
  async findAllForSchedule() {}

  // Коли оновлюється назва дисципліни в навчальному плані - змінюю назву цієї дисципліни для всіх group-load-lessons
  async updateName(dto: UpdateGroupLoadLessonNameDto) {
    // Коли змінюється назва дисципліни в plan-subjects - змінюю назву в group-load-lessons
    const lessons = await this.groupLoadLessonsRepository.find({
      where: { planSubjectId: { id: dto.planSubjectId }, name: dto.oldName },
    });

    if (!lessons.length) throw new NotFoundException('Дисципліну не знайдено');

    lessons.map(async (el) => {
      this.groupLoadLessonsRepository.save({
        ...el,
        name: dto.newName,
      });
    });

    return true;
  }

  // Коли створив перший семестр для конкретної дисципліни - треба створити для цієї дисципліни group-load-lessons
  // Коли оновлюється кількість годин в якомусь семестрі - змінюю години цієї дисципліни для всіх group-load-lessons
  async updateHours(dto: UpdateGroupLoadLessonHoursDto) {
    const oldLessonsHours = await this.groupLoadLessonsRepository.find({
      where: { planSubjectId: { id: dto.planSubject.id } },
      relations: { group: true, plan: true },
      select: {
        id: true,
        name: true,
        hours: true,
        semester: true,
        specialization: true,
        stream: true,
        students: true,
        subgroupNumber: true,
        teacher: { id: true },
        typeEn: true,
        typeRu: true,
        planSubjectId: { id: true },
        group: { id: true },
        plan: { id: true },
      },
    });

    // Шукаю всі групи до яких прикріплений навчальний план
    const groups = await this.groupRepository.find({
      where: { educationPlan: { id: dto.planId } },
      relations: { educationPlan: true },
      select: {
        id: true,
        students: true,
        educationPlan: { id: true },
      },
    });

    const newLessonsHours = [];

    groups.forEach((group) => {
      const lessons = this.convertPlanSubjectsToGroupLoadLessons(
        [dto.planSubject],
        group.id,
        group.educationPlan.id,
        group.students,
      );

      newLessonsHours.push(...lessons);
    });

    // const uniqueGroups: {
    //   groupId: number;
    //   groupName: string;
    //   planId: number;
    //   students: number;
    // }[] = [];

    // oldLessonsHours.forEach((el) => {
    //   const findedGroup = uniqueGroups.find((g) => g.groupId === el.group.id);

    //   if (!findedGroup) {
    //     uniqueGroups.push({
    //       groupId: el.group.id,
    //       groupName: el.group.name,
    //       planId: el.plan.id,
    //       students: el.students,
    //     });
    //   }
    // });

    // uniqueGroups.forEach((group) => {
    //   const lessons = this.convertPlanSubjectsToGroupLoadLessons(
    //     [dto.planSubject],
    //     group.groupId,
    //     group.planId,
    //     group.students,
    //   );

    //   newLessonsHours.push(...lessons);
    // });

    /*  */

    // Оновлені, видалені та нові створені дисципліни
    // const updatedSubjects = [];
    // const removedSubjects = [];
    // const addedSubjects = [];

    // Шукаю оновлені та створені дисципліни
    for (let i = 0; i < newLessonsHours.length; i++) {
      // Шукаю в старому масиві дисциплін дисципліни з нового масиву
      const findedLesson = oldLessonsHours.find((el) => {
        return (
          el.typeEn === newLessonsHours[i].typeEn &&
          el.semester === newLessonsHours[i].semester &&
          el.group.id === newLessonsHours[i].group.id
        );
      });

      // Якщо в обох масивах дисципліна є - додаю її до масиву дисциплін, що оновлені
      if (findedLesson) {
        // updatedSubjects.push(findedLesson); !!!!!!!

        this.groupLoadLessonsRepository.save({
          ...findedLesson,
          ...newLessonsHours[i],
        });
      } else {
        // Оскільки я порівнюю старий масив з новим, то якщо дисципліна не знайдена - її видалено
        // Якщо в старому масиві дисципліна не знайдена - отже вона була додана
        // addedSubjects.push(newLessonsHours[i]); !!!!!!!

        const { id, ...rest } = newLessonsHours[i];

        const newLesson = this.groupLoadLessonsRepository.create(rest);
        await this.groupLoadLessonsRepository.save(newLesson);
      }
    }

    // шукаю видалені дисципліни
    for (let i = 0; i < oldLessonsHours.length; i++) {
      // Шукаю в новому масиві дисциплін дисципліни з старого масиву
      const findedLesson = newLessonsHours.find((el) => {
        if (!oldLessonsHours[i]) return;
        return (
          el.typeEn === oldLessonsHours[i].typeEn &&
          el.semester === oldLessonsHours[i].semester &&
          el.group.id === oldLessonsHours[i].group.id
        );
      });

      // Якщо в новому масиві дисципліна не знайдена - отже вона була видалена
      if (!findedLesson) {
        await this.groupLoadLessonsRepository.delete(oldLessonsHours[i].id);
        // removedSubjects.push(oldLessonsHours[i]); !!!!!!!
      }
    }

    // console.log(oldLessonsHours);
    // console.log(newLessonsHours);

    // console.log(updatedSubjects);
    // console.log(removedSubjects);
    // console.log(addedSubjects);
    return;

    // return {
    //   update: updatedSubjects,
    //   removed: removedSubjects,
    //   added: addedSubjects,
    // };
  }

  // Коли для групи прикріплюється інший (відмінний від попереднього) план
  // Треба споатку видалити всі group-load-lessons старого плану (за це відповідає this.removeAll())
  // Потім створити всі нові group-load-lessons для нового плану (за це відповідає this.createAll())
  async removeAll(groupId: number) {
    const lessons = await this.groupLoadLessonsRepository.find({
      where: { group: { id: groupId } },
    });

    // removeAll removeOne дуже схожі методи - потрібно відрефакторити !!!!!!!!!!!!!!!!!!!!!!!!!!!!

    lessons.map(async (lesson) => {
      await this.groupLoadLessonsRepository.delete(lesson.id);
    });

    return true;
  }

  // Коли видаляється дисципліна навчального плану - потрібно видаляти також і group-load-lessons
  async removeOne(planSubjectId: number) {
    const lessons = await this.groupLoadLessonsRepository.find({
      where: { planSubjectId: { id: planSubjectId } },
    });

    lessons.map(async (lesson) => {
      await this.groupLoadLessonsRepository.delete(lesson.id);
    });

    return true;
  }
}

/* 
const oldLessonsHours = [
  {
    id: 18,
    name: 'subject name 1',
    semester: 2,
    specialization: null,
    typeRu: 'СЕМ',
    typeEn: 'seminars',
    hours: 20,
    stream: null,
    subgroupNumber: null,
    students: 11,
    group: {
      id: 8,
    },
    plan: {
      id: 1,
    },
  },
  {
    id: 16,
    name: 'subject name 1',
    semester: 2,
    specialization: null,
    typeRu: 'ЛК',
    typeEn: 'lectures',
    hours: 12,
    stream: null,
    subgroupNumber: null,
    students: 11,
    group: {
      id: 8,
    },
    plan: {
      id: 1,
    },
  },
  {
    id: 21,
    name: 'subject name 1',
    semester: 2,
    specialization: null,
    typeRu: 'СЕМ',
    typeEn: 'seminars',
    hours: 20,
    stream: null,
    subgroupNumber: null,
    students: 11,
    group: {
      id: 7,
    },
    plan: {
      id: 1,
    },
  },
  {
    id: 22,
    name: 'subject name 1',
    semester: 2,
    specialization: null,
    typeRu: 'ЛК',
    typeEn: 'lectures',
    hours: 12,
    stream: null,
    subgroupNumber: null,
    students: 11,
    group: {
      id: 7,
    },
    plan: {
      id: 1,
    },
  },
];

const newLessonsHours = [
  {
    name: 'subject name 1',
    group: {
      id: 8,
    },
    plan: {
      id: 1,
    },
    planSubjectId: {
      id: 7,
    },
    semester: 2,
    specialization: null,
    typeRu: 'ЛК',
    typeEn: 'lectures',
    hours: 14,
    teacher: null,
    stream: null,
    subgroupNumber: null,
    students: 11,
  },
  {
    name: 'subject name 1',
    group: {
      id: 8,
    },
    plan: {
      id: 1,
    },
    planSubjectId: {
      id: 7,
    },
    semester: 2,
    specialization: null,
    typeRu: 'ЛАБ',
    typeEn: 'laboratory',
    hours: 24,
    teacher: null,
    stream: null,
    subgroupNumber: null,
    students: 11,
  },
  {
    name: 'subject name 1',
    group: {
      id: 8,
    },
    plan: {
      id: 1,
    },
    planSubjectId: {
      id: 7,
    },
    semester: 2,
    specialization: null,
    typeRu: 'ЕКЗ',
    typeEn: 'exams',
    hours: 2,
    teacher: null,
    stream: null,
    subgroupNumber: null,
    students: 11,
  },
  {
    name: 'subject name 1',
    group: {
      id: 7,
    },
    plan: {
      id: 1,
    },
    planSubjectId: {
      id: 7,
    },
    semester: 2,
    specialization: null,
    typeRu: 'ЛК',
    typeEn: 'lectures',
    hours: 14,
    teacher: null,
    stream: null,
    subgroupNumber: null,
    students: 11,
  },
  {
    name: 'subject name 1',
    group: {
      id: 7,
    },
    plan: {
      id: 1,
    },
    planSubjectId: {
      id: 7,
    },
    semester: 2,
    specialization: null,
    typeRu: 'ЛАБ',
    typeEn: 'laboratory',
    hours: 24,
    teacher: null,
    stream: null,
    subgroupNumber: null,
    students: 11,
  },
  {
    name: 'subject name 1',
    group: {
      id: 7,
    },
    plan: {
      id: 1,
    },
    planSubjectId: {
      id: 7,
    },
    semester: 2,
    specialization: null,
    typeRu: 'ЕКЗ',
    typeEn: 'exams',
    hours: 2,
    teacher: null,
    stream: null,
    subgroupNumber: null,
    students: 11,
  },
];

const removedSubjects = [];
const addedSubjects = [];
const updatedSubjects = [];

// Порівнюю в якому масиві (старих дисциплін чи нових) більше дисциплін
const maxLength = Math.max(oldLessonsHours.length, newLessonsHours.length);

// Шукаю оновлені та видалені дисципліни
for (let i = 0; i < newLessonsHours.length; i++) {
  if (!newLessonsHours[i]) {
    console.log('Всі дисципліни перевірені');
    break;
  }

  // Шукаю в старому масиві дисциплін дисципліни з нового масиву
  const findedLesson = oldLessonsHours.find(el => {
    return (
      el.typeEn === newLessonsHours[i].typeEn &&
      el.semester === newLessonsHours[i].semester &&
      el.group.id === newLessonsHours[i].group.id
    );
  });

  // Якщо в обох масивах дисципліна є - додаю її до масиву дисциплін, що оновлені
  if (findedLesson) {
    updatedSubjects.push(findedLesson);
  } else {
    // Оскільки я порівнюю старий масив з новим, то якщо дисципліна не знайдена - її видалено
    // Якщо в старому масиві дисципліна не знайдена - отже вона була додана
    addedSubjects.push(newLessonsHours[i]);
  }
}

// шукаю нові дисципліни
for (let i = 0; i < oldLessonsHours.length; i++) {
  if (!newLessonsHours[i]) {
    console.log('Всі дисципліни перевірені');
    break;
  }

  // Шукаю в новому масиві дисциплін дисципліни з старого масиву
  const findedLesson = newLessonsHours.find(el => {
    return (
      el.typeEn === oldLessonsHours[i].typeEn &&
      el.semester === oldLessonsHours[i].semester &&
      el.group.id === oldLessonsHours[i].group.id
    );
  });

  // Якщо в новому масиві дисципліна не знайдена - отже вона була видалена
  if (!findedLesson) {
    removedSubjects.push(oldLessonsHours[i]);
  }
}

console.log({
  removed: removedSubjects,
  added: addedSubjects,
  updated: updatedSubjects,
});


*/
