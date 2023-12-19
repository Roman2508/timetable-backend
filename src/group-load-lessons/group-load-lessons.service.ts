import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateGroupLoadLessonDto } from './dto/create-group-load-lesson.dto';
import { UpdateGroupLoadLessonDto } from './dto/update-group-load-lesson.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { GroupLoadLessonEntity } from './entities/group-load-lesson.entity';
import { Repository } from 'typeorm';
import { PlanSubjectEntity } from 'src/plan-subjects/entities/plan-subject.entity';

@Injectable()
export class GroupLoadLessonsService {
  constructor(
    @InjectRepository(GroupLoadLessonEntity)
    private groupLoadLessonsRepository: Repository<GroupLoadLessonEntity>,

    @InjectRepository(PlanSubjectEntity)
    private planSubjectsRepository: Repository<PlanSubjectEntity>,
  ) {}

  async create(dto: CreateGroupLoadLessonDto) {
    try {
      const selectedPlanSubjects = await this.planSubjectsRepository.find({
        where: { plan: { id: dto.educationPlanId } },
      });

      if (!selectedPlanSubjects.length) {
        throw new NotFoundException('Навчальний план не знайдено');
      }

      const groupLoadLessons: GroupLoadLessonEntity[] = [];

      const subjectTypes = [
        { name: 'lectures', alias: { ru: 'ЛК', en: 'lectures' } },
        { name: 'practical', alias: { ru: 'ПЗ', en: 'practical' } },
        { name: 'laboratory', alias: { ru: 'ЛАБ', en: 'laboratory' } },
        { name: 'seminars', alias: { ru: 'СЕМ', en: 'seminars' } },
        { name: 'exams', alias: { ru: 'ЕКЗ', en: 'exams' } },
      ];

      selectedPlanSubjects.map(async (lesson) => {
        for (let key in lesson) {
          const findedSubjectType = subjectTypes.find(
            (type) => type.name === key,
          );

          // Якщо дисципліну знайдено (за типом) і кількість годин !== 0 - створюю group-load-lesson
          if (findedSubjectType && lesson[findedSubjectType?.name] !== 0) {
            const payload = {
              name: lesson.name,
              group: { id: dto.groupId },
              plan: { id: dto.educationPlanId },
              planSubjectId: { id: lesson.id },
              semester: lesson.semesterNumber,
              specialization: null,
              typeRu: findedSubjectType.alias.ru,
              typeEn: findedSubjectType.alias.en,
              hours: lesson[key],
              teacher: null,
              stream: null,
              subgroupNumber: null,
              students: dto.students,
            };

            const newLesson = this.groupLoadLessonsRepository.create(payload);

            groupLoadLessons.push(
              await this.groupLoadLessonsRepository.save(newLesson),
            );
          }
        }
      });

      return groupLoadLessons;
    } catch (err) {
      console.log(err.message);
      throw new BadRequestException('Помилка при створенні навантаження групи');
    }
  }

  findAllByGroupId(id: number) {
    return `This action returns all groupLoadLessons`;
  }

  // findOne(id: number) {
  //   return `This action returns a #${id} groupLoadLesson`;
  // }

  async updateName(dto: UpdateGroupLoadLessonDto) {
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

  updateHours(dto: UpdateGroupLoadLessonDto) {
    return 'update hours';
  }
}

/* 

const plan = [
  {
    id: 7,
    name: 'subject name 1',
    totalHours: 34,
    semesterNumber: 2,
    lectures: 12,
    practical: 0,
    laboratory: 0,
    seminars: 20,
    exams: 2,
    plan: 1,
  },
  {
    id: 8,
    name: 'updated subject name',
    totalHours: 48,
    semesterNumber: 2,
    lectures: 12,
    practical: 0,
    laboratory: 36,
    seminars: 0,
    exams: 4,
    plan: 1,
  },
];

const newPlan = [plan[1]];

// find by { plan subject id, name, semester, group } all lessons in group-load

const payload = {
  plan: plan[0].plan,
  planSubjectId: plan[0].planSubjectId,
  name: plan[0].name,
  semester: plan[0].semester,
  group: plan[0].group,
  newHours: plan[1],
};

const lessons = [
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
    group: 8,
    teacher: null,
    planSubjectId: 7,
    planId: 1,
  },
  {
    id: 17,
    name: 'subject name 1',
    semester: 2,
    specialization: null,
    typeRu: 'СЕМ',
    typeEn: 'seminars',
    hours: 20,
    stream: null,
    subgroupNumber: null,
    students: 11,
    group: 8,
    teacher: null,
    planSubjectId: 7,
    planId: 1,
  },
  {
    id: 18,
    name: 'subject name 1',
    semester: 2,
    specialization: null,
    typeRu: 'ЕКЗ',
    typeEn: 'exams',
    hours: 2,
    stream: null,
    subgroupNumber: null,
    students: 11,
    group: 8,
    teacher: null,
    planSubjectId: 7,
    planId: 1,
  },
  {
    id: 19,
    name: 'subject name 2',
    semester: 2,
    specialization: null,
    typeRu: 'ЕКЗ',
    typeEn: 'exams',
    hours: 2,
    stream: null,
    subgroupNumber: null,
    students: 11,
    group: 9,
    teacher: null,
    planSubjectId: 7,
    planId: 1,
  },
];

const oldLessonsHours = lessons;

const subjectTypes = [
  { name: 'lectures', alias: { ru: 'ЛК', en: 'lectures' } },
  { name: 'practical', alias: { ru: 'ПЗ', en: 'practical' } },
  { name: 'laboratory', alias: { ru: 'ЛАБ', en: 'laboratory' } },
  { name: 'seminars', alias: { ru: 'СЕМ', en: 'seminars' } },
  { name: 'exams', alias: { ru: 'ЕКЗ', en: 'exams' } },
];

const newLessonsHours = [];

newPlan.map(el => {
  for (let key in el) {
    const findedSubjectType = subjectTypes.find(type => type.name === key);

    if (findedSubjectType && el[findedSubjectType.name] !== 0) {
      const payload = {
        name: el.name,
        group: 8,
        plan: el.plan,
        planSubjectId: el.id,
        semester: el.semesterNumber,
        specialization: null,
        typeRu: findedSubjectType.alias.ru,
        typeEn: findedSubjectType.alias.en,
        hours: el[key],
        teacher: null,
        stream: null,
        subgroupNumber: null,
        students: 11,
      };

      newLessonsHours.push(payload);
    }
  }
});

const updatedSubjects = [];
const removedSubjects = [];
const addedSubjects = [];

// Порівнюю в якому масиві (старих дисциплін чи нових) більше дисциплін
const maxLength = Math.max(oldLessonsHours.length, newLessonsHours.length);

for (let i = 0; i < maxLength; i++) {
  if (!newLessonsHours[i]) {
    console.log('Всі дисципліни перевірені');
    break;
  }

  // Шукаю в старому масиві дисциплін дисципліни з нового масиву
  const findedLesson = oldLessonsHours.find(
    el =>
      el.typeEn === newLessonsHours[i].typeEn &&
      el.semester === newLessonsHours[i].semester &&
      el.group === newLessonsHours[i].group
  );

  // Якщо в обох масивах дисципліна є - додаю її до масиву дисциплін, що оновлені
  if (findedLesson) {
    updatedSubjects.push(findedLesson);
  } else {
    // Оскільки я порівнюю старий масив з новим, то якщо дисципліна не знайдена - її видалено
    // Якщо в новому масиві дисципліна не знайдена - отже вона була видалена
    removedSubjects.push(oldLessonsHours[i]);
  }

  console.log(findedLesson?.typeEn);
}

for (let i = 0; i < maxLength; i++) {
  if (!newLessonsHours[i]) {
    console.log('Всі дисципліни перевірені');
    break;
  }

  // Шукаю в новому масиві дисциплін дисципліни з старого масиву
  const findedLesson = newLessonsHours.find(
    el =>
      el.typeEn === oldLessonsHours[i].typeEn &&
      el.semester === oldLessonsHours[i].semester &&
      el.group === oldLessonsHours[i].group
  );

  // Якщо в старому масиві дисципліна не знайдена - отже вона була додана
  if (!findedLesson) {
    addedSubjects.push(newLessonsHours[i]);
  }
}

console.log(updatedSubjects);
console.log(removedSubjects);
console.log(addedSubjects);

// console.log(oldLessonsHours);
// console.log(newLessonsHours);

*/
