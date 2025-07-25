import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, IsNull, Not, Repository, And, In } from 'typeorm';
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';

import { GradesService } from 'src/grades/grades.service';
import { GroupEntity } from 'src/groups/entities/group.entity';
import { SetSubgroupsCountDto } from './dto/set-subgroups-count.dto';
import { TeacherEntity } from 'src/teachers/entities/teacher.entity';
import { AddStudentToLessonDto } from './dto/add-student-to-lesson.dto';
import { AttachSpecializationDto } from './dto/attach-specialization.dto';
import { LessonsTypeRu } from 'src/grade-book/entities/grade-book.entity';
import { GroupLoadLessonEntity } from './entities/group-load-lesson.entity';
import { CreateGroupLoadLessonDto } from './dto/create-group-load-lesson.dto';
import { AddLessonsToStreamDto } from '../streams/dto/add-lessons-to-stream.dto';
import { DeleteStudentFromLessonDto } from './dto/delete-student-from-lesson.dto';
import { PlanSubjectEntity } from 'src/plan-subjects/entities/plan-subject.entity';
import { UpdateGroupLoadLessonNameDto } from './dto/update-group-load-lesson-name.dto';
import { UpdateGroupLoadLessonHoursDto } from './dto/update-group-load-lesson-hours.dto';
import { RemoveLessonsFromStreamDto } from 'src/streams/dto/remove-lessons-from-stream.dto';
import { AddStudentsToAllGroupLessonsDto } from './dto/add-students-to-all-group-lessons.dto';
import { DeleteStudentsFromAllGroupLessonsDto } from './dto/delete-students-to-all-group-lessons.dto';
import e from 'express';

@Injectable()
export class GroupLoadLessonsService {
  constructor(
    @InjectRepository(GroupLoadLessonEntity)
    private groupLoadLessonsRepository: Repository<GroupLoadLessonEntity>,

    @InjectRepository(PlanSubjectEntity)
    private planSubjectsRepository: Repository<PlanSubjectEntity>,

    @InjectRepository(GroupEntity)
    private groupRepository: Repository<GroupEntity>,

    @InjectRepository(TeacherEntity)
    private teacherRepository: Repository<TeacherEntity>,

    private readonly gradesService: GradesService,
  ) {}

  // !important
  // check students changes in:
  // - convertPlanSubjectsToGroupLoadLessons
  // - createAll
  // - updateHours

  // Конвертує дисципліну навчального плану в масив group-load-lessons
  convertPlanSubjectsToGroupLoadLessons(
    planSubjects: PlanSubjectEntity[],
    groupId: number,
    planId: number,
    // students: number,
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
        const findedSubjectType = subjectTypes.find((type) => type.name === key);

        // Якщо дисципліну знайдено (за типом) і кількість годин !== 0 - створюю group-load-lesson
        if (findedSubjectType && Number(lesson[findedSubjectType?.name]) !== 0) {
          const payload = {
            name: lesson.name,
            group: { id: groupId },
            plan: { id: planId },
            cmk: { id: lesson.cmk ? lesson.cmk.id : null },
            planSubjectId: { id: lesson.id },
            semester: lesson.semesterNumber,
            specialization: null,
            typeRu: findedSubjectType.alias.ru,
            typeEn: findedSubjectType.alias.en,
            hours: lesson[key],
            teacher: null,
            stream: null,
            subgroupNumber: null,
            students: [],
          };

          // ???
          groupLoadLessons.push(payload);
        }
      }
    });

    return groupLoadLessons;
  }

  getCurrentCourseSemesters(courseNumber: number) {
    let semesters = [];

    if (courseNumber === 1) {
      semesters = [1, 2];
    } else if (courseNumber === 2) {
      semesters = [3, 4];
    } else if (courseNumber === 3) {
      semesters = [5, 6];
    } else {
      // throw new BadRequestException('Не вірно заданий курс групи (має бути 1, 2 або 3)');
    }

    return semesters;
  }

  getStudyYear(yearOfAdmission: number) {
    const currentYear = new Date().getFullYear();
    let currentMonth = new Date().getMonth();

    // Університетський рік починається у вересні
    const isAfterSeptember = currentMonth >= 8;

    // Розрахунок курсу
    const course = currentYear - yearOfAdmission + (isAfterSeptember ? 1 : 0);

    // Перевірка на допустимі значення курсу
    if (course < 1) {
      return 'Група ще не почала навчання';
    } else if (course > 4) {
      return 'Група завершила навчання';
    }
    return course;
  }

  async findOneLessonById(id: number) {
    const lesson = await this.groupLoadLessonsRepository.findOne({
      where: { id },
      relations: {
        stream: true,
        teacher: true,
        group: true,
        planSubjectId: true,
        unitedWith: true,
      },
      select: {
        group: { id: true, name: true },
        stream: { id: true, name: true },
        unitedWith: { id: true, name: true },
        teacher: { id: true, firstName: true, middleName: true, lastName: true },
      },
    });

    if (!lesson) throw new NotFoundException('Дисципліну не знайдено');

    return lesson;
  }

  // для instructional-matherials
  async findAllTeacherLessonsById(teacherId: number, year?: string) {
    const lessons = await this.groupLoadLessonsRepository.find({
      where: {
        teacher: { id: teacherId },
        typeEn: And(Not('exams'), Not('examsConsulation'), Not('metodologicalGuidance')),
      },
      relations: {
        stream: true,
        teacher: true,
        group: true,
        planSubjectId: true,
        unitedWith: true,
      },
      select: {
        stream: { id: true, name: true },
        unitedWith: { id: true, name: true },
        teacher: { id: true, firstName: true, middleName: true, lastName: true },
        group: { id: true, name: true, yearOfAdmission: true, courseNumber: true },
      },
    });

    if (!lessons) throw new NotFoundException('Дисципліни не знайдено');

    const currentYearLessons = lessons.map((el) => {
      let semesters;

      if (year) {
        const courseNumber = +year - el.group.yearOfAdmission + 1;
        semesters = this.getCurrentCourseSemesters(courseNumber);
      } else {
        semesters = this.getCurrentCourseSemesters(el.group.courseNumber);
      }
      if (semesters.some((s) => s === el.semester)) {
        return el;
      }

      return null;
    });

    return currentYearLessons.filter((el) => !!el);
  }

  // Коли при створенні групи для неї вперше прикріплюється навчальний план - створюю для всіх дисциплін плану group-load-lessons
  // Або коли для групи прикріплюється інший (відмінний від попереднього) план
  // Треба споатку видалити всі group-load-lessons старого плану (за це відповідає this.removeByGroupId())
  // Потім створити всі нові group-load-lessons для нового плану (за це відповідає this.createAll())
  async createAll(dto: CreateGroupLoadLessonDto) {
    try {
      // Шукаю всі дисципліни в навчальному плані
      const selectedPlanSubjects = await this.planSubjectsRepository.find({
        where: { plan: { id: dto.educationPlanId } },
        relations: { cmk: true },
        select: { cmk: { id: true } },
      });

      // В плані відсутні дисципліни
      if (!selectedPlanSubjects.length) {
        return [];
      }

      const newLessons = this.convertPlanSubjectsToGroupLoadLessons(
        selectedPlanSubjects,
        dto.groupId,
        dto.educationPlanId,
        // dto.students,
      );

      return Promise.all(
        newLessons.map(async (el: GroupLoadLessonEntity) => {
          const payload = this.groupLoadLessonsRepository.create(el);
          const newLesson = await this.groupLoadLessonsRepository.save(payload);
          return newLesson;
        }),
      );
    } catch (err) {
      console.log(err.message);
      throw new BadRequestException('Помилка при створенні навантаження групи');
    }
  }

  async findAllByGroupId(groupId: number) {
    const lessons = await this.groupLoadLessonsRepository.find({
      where: { group: { id: groupId } },
      relations: {
        group: true,
        planSubjectId: true,
        stream: { groups: true },
        teacher: true,
        unitedWith: true,
      },
      select: {
        planSubjectId: { id: true },
        group: { id: true, name: true },
        unitedWith: { id: true, name: true },
        stream: { id: true, name: true, groups: { id: true, name: true } },
        teacher: { id: true, firstName: true, middleName: true, lastName: true },
      },
    });

    if (!lessons.length) throw new NotFoundException('Дисципліни не знайдені');

    return lessons;
  }

  async findAllByGroupIdAndSemester(semester: number, groupId: number) {
    const lessons = await this.groupLoadLessonsRepository.find({
      where: { group: { id: groupId }, semester },
      relations: {
        group: true,
        planSubjectId: true,
      },
      select: {
        id: true,
        name: true,
        typeRu: true,
        subgroupNumber: true,
        planSubjectId: { id: true },
        group: { id: true, name: true },
      },
    });

    if (!lessons.length) throw new NotFoundException('Дисципліни не знайдені');

    return lessons;
  }

  // Навантаження групи з урахуванням курсу навчання (тобто якщо група 1 курсу то повертаються
  // лише дисципліни 1 та 2 семестру, якщо 2 курсу то дисципліни 2 та 4 семестру і т.д.)
  // Використовується для розподілу навантаження та розкладу
  async getGroupLoadByCurrentCourse(groupId: number) {
    const group = await this.groupRepository.findOne({ where: { id: groupId } });
    if (!group) throw new NotFoundException('Групу не знайдено');

    const semesters = this.getCurrentCourseSemesters(group.courseNumber);

    return this.groupLoadLessonsRepository.find({
      where: { group: { id: groupId }, semester: In(semesters) },
      relations: {
        group: true,
        teacher: true,
        planSubjectId: true,
        stream: { groups: true },
      },
      select: {
        id: true,
        name: true,
        hours: true,
        typeEn: true,
        typeRu: true,
        semester: true,
        subgroupNumber: true,
        planSubjectId: { id: true },
        group: { id: true, name: true },
        stream: { id: true, name: true, groups: { id: true, name: true } },
        teacher: { id: true, firstName: true, lastName: true, middleName: true },
      },
    });
  }

  // Навантаження, що йде на розклад (без консультацій до екзамену та метод. керівництва)
  async findLessonsForSchedule(semester: number, scheduleType: 'group' | 'teacher', itemId: number) {
    if (scheduleType === 'group') {
      const group = await this.groupRepository.findOne({ where: { id: itemId } });

      if (!group) throw new NotFoundException('Групу не знайдено');

      const semesters = this.getCurrentCourseSemesters(group.courseNumber);

      const lessons = await this.groupLoadLessonsRepository.find({
        where: {
          group: { id: itemId },
          semester: semesters[semester - 1],
          teacher: Not(IsNull()),
          typeEn: Not('metodologicalGuidance'), // And(Not('examsConsulation'), Not('metodologicalGuidance'))
        },
        relations: {
          group: true,
          teacher: true,
          students: true,
          planSubjectId: true,
          stream: { groups: true },
        },
        select: {
          planSubjectId: { id: true },
          group: { id: true, name: true },
          students: { id: true, status: true },
          stream: { id: true, name: true, groups: { id: true, name: true } },
          teacher: { id: true, firstName: true, middleName: true, lastName: true },
        },
      });

      const lessonWithStudyingStudents = lessons.map((el) => {
        const students = el.students.filter((el) => el.status === 'Навчається');
        return { ...el, students: students.map((s) => s.id) };
      });

      return lessonWithStudyingStudents.filter((el) => el.specialization !== 'Не вивчається');
    }

    if (scheduleType === 'teacher') {
      const lessons = await this.groupLoadLessonsRepository.find({
        where: {
          // semester,
          teacher: { id: itemId },
          typeEn: Not('metodologicalGuidance'), // And(Not('examsConsulation'), Not('metodologicalGuidance'))
        },
        relations: {
          group: true,
          teacher: true,
          students: true,
          planSubjectId: true,
          stream: { groups: true },
        },
        select: {
          planSubjectId: { id: true },
          students: { id: true, status: true },
          group: { id: true, name: true, courseNumber: true },
          stream: { id: true, name: true, groups: { id: true, name: true } },
          teacher: { id: true, firstName: true, middleName: true, lastName: true },
        },
      });

      const currentSemesterLessons = await Promise.all(
        lessons.map(async (el) => {
          const groupId = el.group.id;
          const group = await this.groupRepository.findOne({ where: { id: groupId } });
          if (!group) throw new NotFoundException('Групу не знайдено');
          const semesters = this.getCurrentCourseSemesters(group.courseNumber);

          if (semesters.some((s) => s === el.semester)) {
            return el;
          }

          if (el.specialization === 'Не вивчається') return null;

          return null;
        }),
      );

      const semesterLessons = currentSemesterLessons.filter((el) => !!el);

      const lessonWithStudyingStudents = semesterLessons.map((el) => {
        const students = el.students.filter((el) => el.status === 'Навчається');
        return { ...el, students: students.map((s) => s.id) };
      });

      return lessonWithStudyingStudents;
    }

    return [];
  }

  // Коли оновлюється назва дисципліни в навчальному плані - змінюю назву цієї дисципліни для всіх group-load-lessons
  async updateName(dto: UpdateGroupLoadLessonNameDto) {
    // Коли змінюється назва дисципліни в plan-subjects - змінюю назву в group-load-lessons
    const lessons = await this.groupLoadLessonsRepository.find({
      where: { planSubjectId: { id: dto.planSubjectId }, name: dto.oldName },
    });

    if (!lessons.length) return;
    // if (!lessons.length) throw new NotFoundException('Дисципліну не знайдено');

    lessons.map(async (el) => {
      this.groupLoadLessonsRepository.save({
        ...el,
        name: dto.newName,
        cmk: { id: dto.cmk },
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
        stream: { id: true },
        students: true,
        subgroupNumber: true,
        teacher: { id: true },
        typeEn: true,
        typeRu: true,
        planSubjectId: { id: true },
        group: { id: true },
        plan: { id: true },
        // cmk: { id: true },
      },
    });

    // Шукаю всі групи до яких прикріплений навчальний план
    const groups = await this.groupRepository.find({
      where: { educationPlan: { id: dto.planId } },
      relations: { educationPlan: true, students: true },
      select: {
        id: true,
        students: { id: true },
        educationPlan: { id: true },
      },
    });

    const newLessonsHours = [];

    groups.forEach((group) => {
      const lessons = this.convertPlanSubjectsToGroupLoadLessons(
        [dto.planSubject],
        group.id,
        group.educationPlan.id,
        // group.students.length,
      );

      newLessonsHours.push(...lessons);
    });

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

    return;
  }

  // Коли для групи прикріплюється інший (відмінний від попереднього) план
  // Треба споатку видалити всі group-load-lessons старого плану (за це відповідає this.removeByGroupId())
  // Потім створити всі нові group-load-lessons для нового плану (за це відповідає this.createAll())
  async removeByGroupId(groupId: number) {
    await this.groupLoadLessonsRepository.delete({
      group: { id: groupId },
    });
    return true;
  }

  // Коли видаляється дисципліна навчального плану - потрібно видаляти також і group-load-lessons
  async removeByPlanId(planSubjectId: number) {
    await this.groupLoadLessonsRepository.delete({
      planSubjectId: { id: planSubjectId },
    });

    return true;
  }

  // Студенти, які ходять на дисципліну (для students/accounts )
  // Повертається дисципліна включно з студентами
  async getLessonStudents(
    semester: number,
    lessonId: number,
    typeRu: LessonsTypeRu,
    specialization: string | null,
    stream?: number,
  ) {
    let where: any = { id: lessonId, semester, typeRu };

    if (specialization) {
      where = { ...where, specialization };
    }

    if (stream) {
      where = { ...where, stream: { id: stream } };
    }

    const lessons = await this.groupLoadLessonsRepository.find({
      where,
      relations: { students: true },
      select: { students: { id: true, name: true } },
    });

    return lessons;
  }

  /* students */
  /* students */
  /* students */
  // Студенти, які ходять на дисципліну (для students/divide )
  // Повертається тільки список студентів
  async findLessonStudents(id: number) {
    const lessons = await this.groupLoadLessonsRepository.findOne({
      where: {
        id,
        typeEn: And(Not('examsConsulation'), Not('metodologicalGuidance'), Not('exams')),
        // students: { status: And(Not(StudentStatus.ACADEMIC_LEAVE), Not(StudentStatus.EXPELLED)) },
      },
      relations: { group: true, students: true },
      select: { group: { id: true, name: true }, students: { id: true, name: true, status: true } },
    });

    if (!lessons) throw new NotFoundException('Дисципліна не знайдена');
    const students = lessons.students.filter((el) => el.status === 'Навчається');
    return students;
  }

  async addStudentToLesson(dto: AddStudentToLessonDto) {
    const lesson = await this.groupLoadLessonsRepository.findOne({
      where: { id: dto.lessonId },
      relations: { students: true, stream: { groups: true }, unitedWith: { students: true } },
      select: {
        students: { id: true },
        unitedWith: { id: true, students: { id: true } },
        stream: { id: true, groups: { id: true } },
      },
    });

    if (!lesson) throw new NotFoundException('Дисипліну не знайдено');

    // Якщо дисципліна об'єднана в потік і кількість груп в потоці більше 1 - зараховую студентів на дисц. всіх груп потоку.
    if (lesson.stream && lesson.stream.groups.length > 1) {
      await Promise.all(
        lesson.unitedWith.map(async (l) => {
          /* add student to group-load-lessons */
          const students = dto.studentIds.map((id) => ({ id }));
          await this.groupLoadLessonsRepository.save({ id: l.id, students: [...l.students, ...students] });
          // /* CREATE grades */
          await this.gradesService.create({ lessonId: l.id, studentIds: dto.studentIds });
        }),
      );
    } else {
      // Якщо дисципліна не об'єднана в потік - зараховую студентів на одну дисципліну
      /* add student to group-load-lessons */
      const students = dto.studentIds.map((id) => ({ id }));
      await this.groupLoadLessonsRepository.save({ id: lesson.id, students: [...lesson.students, ...students] });
      /* CREATE grades */
      await this.gradesService.create(dto);
    }
    const updatedLesson = await this.groupLoadLessonsRepository.findOne({
      where: { id: lesson.id },
      relations: { group: true, students: true },
      select: { group: { id: true, name: true }, students: { id: true, name: true, status: true } },
    });

    return updatedLesson.students;
  }

  async deleteStudentFromLesson(dto: DeleteStudentFromLessonDto) {
    const lesson = await this.groupLoadLessonsRepository.findOne({
      where: { id: dto.lessonId },
      relations: { students: true, stream: { groups: true }, unitedWith: { students: true } },
      select: {
        students: { id: true },
        stream: { id: true, groups: { id: true } },
        unitedWith: { id: true, students: { id: true } },
      },
    });

    if (!lesson) throw new NotFoundException('Дисциплінау не знайдено');

    let students = JSON.parse(JSON.stringify(lesson.students));

    dto.studentIds.forEach((id) => {
      const data = students.filter((el) => el.id !== id);
      students = data;
    });

    // Якщо дисципліна об'єднана в потік і кількість груп в потоці більше 1 - зараховую студентів на дисц. всіх груп потоку.
    if (lesson.stream && lesson.stream.groups.length > 1) {
      await Promise.all(
        lesson.unitedWith.map(async (l) => {
          let students = JSON.parse(JSON.stringify(l.students));

          dto.studentIds.forEach((id) => {
            const data = students.filter((el) => el.id !== id);
            students = data;
          });

          await this.groupLoadLessonsRepository.save({ id: l.id, students });

          /* DELETE grades */
          await this.gradesService.delete(dto);
        }),
      );
    } else {
      // Якщо дисципліна не об'єднана в потік - відраховую студентів з однієї дисципліни
      await this.groupLoadLessonsRepository.save({ id: lesson.id, students });
      /* DELETE grades */
      await this.gradesService.delete(dto);
    }

    return students;
  }

  async addStudentsToAllGroupLessons(dto: AddStudentsToAllGroupLessonsDto) {
    const lessons = await this.groupLoadLessonsRepository.find({
      where: { group: { id: dto.groupId }, semester: dto.semester },
      relations: { students: true },
      select: { students: { id: true } },
    });

    if (!lessons.length) throw new NotFoundException('Дисипліни не знайдено');

    await Promise.allSettled(
      lessons.map(async (lesson) => {
        await this.addStudentToLesson({ lessonId: lesson.id, studentIds: dto.studentIds });

        // Старий варіант, після тестів видалити
        // const students = dto.studentIds.map((id) => ({ id }));
        // await this.groupLoadLessonsRepository.save({ id: lesson.id, students: [...lesson.students, ...students] });

        // /* CREATE grades */
        // await this.gradesService.create({ lessonId: lesson.id, studentIds: dto.studentIds });
      }),
    );

    return true;
  }

  async deleteStudentsFromAllGroupLessons(dto: DeleteStudentsFromAllGroupLessonsDto) {
    const lessons = await this.groupLoadLessonsRepository.find({
      where: { group: { id: dto.groupId }, semester: dto.semester },
      relations: { students: true },
      select: { students: { id: true } },
    });

    if (!lessons.length) throw new NotFoundException('Дисипліни не знайдено');

    await Promise.all(
      lessons.map(async (lesson) => {
        await this.deleteStudentFromLesson({ lessonId: lesson.id, studentIds: dto.studentIds });
        // let students = JSON.parse(JSON.stringify(lesson.students));

        // dto.studentIds.forEach((id) => {
        //   const data = students.filter((el) => el.id !== id);
        //   students = data;
        // });

        // await this.groupLoadLessonsRepository.save({ id: lesson.id, students });

        // /* DELETE grades */
        // await this.gradesService.delete({ lessonId: lesson.id, studentIds: dto.studentIds });
      }),
    );

    return true;
  }
  /* // students */
  /* // students */
  /* // students */

  /* specialization */
  async attachSpecialization(dto: AttachSpecializationDto) {
    await this.groupLoadLessonsRepository.update(
      {
        group: { id: dto.groupId },
        planSubjectId: { id: dto.planSubjectId },
      },
      {
        specialization: dto.name,
      },
    );

    return dto;
  }

  /* subgroups */
  // Якщо кількість підгруп змінилась - повертається новий масив підгруп, якщо ні - повертається null
  async setSubgroupsCount(dto: SetSubgroupsCountDto) {
    // dto = { planSubjectId, groupId, typeEn, subgroupsCount }

    const lessons = await this.groupLoadLessonsRepository.find({
      where: {
        group: { id: dto.groupId },
        planSubjectId: { id: dto.planSubjectId },
        typeEn: dto.typeEn,
      },
      relations: { group: true, plan: true, planSubjectId: true, cmk: true },
      select: {
        group: { id: true },
        plan: { id: true },
        planSubjectId: { id: true },
        cmk: { id: true },
      },
    });

    if (!lessons.length) throw new NotFoundException('Дисципліна не знайдена');

    if (lessons.length === dto.subgroupsCount) {
      console.log('Однакова кількість підгруп');
      return null;
    }

    // Видалити всі підгрупи крім першої, а для першої встановити subgroupNumber = null
    const removeAllSubgroupsWithoutFirst = (): GroupLoadLessonEntity[] => {
      let firstSubgroup: GroupLoadLessonEntity;

      lessons.map(async (el) => {
        if (el.subgroupNumber === 1) {
          firstSubgroup = {
            ...el,
            subgroupNumber: null,
          };

          await this.groupLoadLessonsRepository.save({
            ...el,
            subgroupNumber: null,
          });
        } else {
          await this.groupLoadLessonsRepository.delete({ id: el.id });
        }
      });

      return [firstSubgroup];
    };

    // subgroupsNumbers - номери підгруп, які потрібно створити
    const createSubgroups = (subgroupsNumbers: number[]): GroupLoadLessonEntity[] => {
      const newAllLessons: GroupLoadLessonEntity[] = [];

      subgroupsNumbers.map(async (number) => {
        const { id, ...rest } = lessons[0];

        const newLesson = this.groupLoadLessonsRepository.create({
          ...rest,
          subgroupNumber: number,
        });

        newAllLessons.push(newLesson);
        await this.groupLoadLessonsRepository.save(newLesson);
      });

      return newAllLessons;
    };

    // subgroupsNumbers - номери підгруп, які потрібно видалити
    const removeSomeSubgroups = (subgroupsNumbers: number[]): GroupLoadLessonEntity[] => {
      const newLessons: GroupLoadLessonEntity[] = [];

      lessons.map(async (el) => {
        // Якщо в масиві subgroupsNumbers номер підгрупи збігається з el.subgroupNumber - цю підгрупу потрібно видалити
        const isNeedToRemove = subgroupsNumbers.some((num) => num === el.subgroupNumber);

        if (isNeedToRemove) {
          await this.groupLoadLessonsRepository.delete({ id: el.id });
        } else {
          // В іншому випадку повертаю цю дисципліну
          newLessons.push(el);
        }
      });

      return newLessons;
    };

    // Якщо зайдено всього 1 дисципліну - отже вона не поділена на підгрупи
    if (lessons.length === 1) {
      const { id, ...rest } = lessons[0];

      const newLessons: GroupLoadLessonEntity[] = [];

      // Спочатку роблю копію дисципліни для всіх підгруп (2, 3 або 4)
      Array(dto.subgroupsCount - 1)
        .fill(null)
        .map(async (_, index) => {
          const newLessonWithSubgroup = this.groupLoadLessonsRepository.create({
            ...rest,
            subgroupNumber: index + 2,
          });

          newLessons.push(newLessonWithSubgroup);

          await this.groupLoadLessonsRepository.save(newLessonWithSubgroup);
        });

      // Потім оригінальну дисципліну роблю 1 підгрупою
      const subgroup1 = await this.groupLoadLessonsRepository.save({
        ...lessons[0],
        subgroupNumber: 1,
      });

      return [subgroup1, ...newLessons];
    }

    if (lessons.length === 2) {
      // Якщо було знайдено 2 дисципліни отже в неї 2 підгрупи

      // Якщо було 2 підгрупи, а стала 1 підгрупа - всі інші потрібно видалити
      if (dto.subgroupsCount === 1) {
        return removeAllSubgroupsWithoutFirst();
      }

      // Якщо було 2 підгрупи, а стало 3 підгрупи - потрібно створити ще одну
      if (dto.subgroupsCount === 3) {
        const newLessons = createSubgroups([3]);
        return [...lessons, ...newLessons];
      }

      // Якщо було 2 підгрупи, а стало 4 підгрупи - потрібно створити ще дві
      if (dto.subgroupsCount === 4) {
        const newLessons = createSubgroups([3, 4]);
        return [...lessons, ...newLessons];
      }
      return null;
    }

    if (lessons.length === 3) {
      // Якщо було 3 підгрупи, а стала 1 підгрупа - всі інші потрібно видалити
      if (dto.subgroupsCount === 1) {
        return removeAllSubgroupsWithoutFirst();
      }

      // Якщо було 3 підгрупи, а стало 2 підгрупи - третю треба видалити
      if (dto.subgroupsCount === 2) {
        return removeSomeSubgroups([3]);
      }

      // Якщо було 3 підгрупи, а стало 4 підгрупи - потрібно створити ще одну
      if (dto.subgroupsCount === 4) {
        const newLessons = createSubgroups([4]);
        return [...lessons, ...newLessons];
      }
      return null;
    }

    if (lessons.length === 4) {
      // Якщо було 4 підгрупи, а стала 1 підгрупа - всі інші потрібно видалити
      if (dto.subgroupsCount === 1) {
        return removeAllSubgroupsWithoutFirst();
      }

      // Якщо було 4 підгрупи, а стало 2 підгрупи - третю та четверту треба видалити
      if (dto.subgroupsCount === 2) {
        return removeSomeSubgroups([3, 4]);
      }

      // Якщо було 4 підгрупи, а стало 3 підгрупи - четверту треба видалити
      if (dto.subgroupsCount === 3) {
        return removeSomeSubgroups([4]);
      }
      return null;
    }

    return null;
  }

  /* streams */
  async addLessonsToStream(streamId: number, dto: AddLessonsToStreamDto) {
    try {
      // Якщо передано 1 або 0 id
      if (dto.lessonsIds.length < 2) {
        throw new BadRequestException("В потік можна об'єднати 2 і більше групи");
      }

      const lessons: GroupLoadLessonEntity[] = [];

      await Promise.all(
        dto.lessonsIds.map(async (id) => {
          const findedLesson = await this.groupLoadLessonsRepository.findOne({
            where: { id },
            relations: { group: true, planSubjectId: true, stream: true, unitedWith: true },
            select: {
              group: { id: true, name: true },
              planSubjectId: { id: true },
              stream: { id: true, name: true },
              unitedWith: { id: true, name: true },
            },
          });

          lessons.push(findedLesson);
        }),
      );

      // Перевірка чи можна об'єднати дисципліни, які передано
      // тобто чи однакові в дисциплін поля: semesterNumber (semester), typeEn, hours, subgroupNumber
      const isAllLessonsSame = lessons.every(
        (value) =>
          value.semester === lessons[0].semester &&
          value.typeEn === lessons[0].typeEn &&
          value.subgroupNumber === lessons[0].subgroupNumber &&
          value.hours === lessons[0].hours,
      );

      // Якщо хоча б 1 поле в 1 дисципліні не однакове
      if (!isAllLessonsSame) throw new BadRequestException("Вибрані дисципліни не можна об'єднати в потік");

      const unitedWithIds = dto.lessonsIds.map((el) => ({ id: el }));

      // Якщо всі потрібні поля у всіх дисциплін однакові - можна об'єднувати в потік
      return Promise.all(
        lessons.map(async (lesson) => {
          return await this.groupLoadLessonsRepository.save({
            ...lesson,
            unitedWith: unitedWithIds,
            stream: { id: streamId, name: dto.streamName },
            // При об'єднанні дисциплін в потік видаляю прикріпленого викладача в кожній дисципліні
            teacher: null,
          });
        }),
      );
    } catch (err) {
      console.log(err?.message);
    }
  }

  async removeLessonsFromStream(dto: RemoveLessonsFromStreamDto) {
    const updatedLessons = [];

    await Promise.allSettled(
      dto.lessonsIds.map(async (id: number) => {
        const lesson = await this.groupLoadLessonsRepository.findOne({
          where: { id },
        });

        if (!lesson) throw new NotFoundException('Дисципліну не знайдено');

        const updatedLesson = await this.groupLoadLessonsRepository.save({
          ...lesson,
          unitedWith: [],
          stream: null,
        });

        updatedLessons.push(updatedLesson);
      }),
    );

    return updatedLessons;
  }

  /* teacher */
  async attachTeacher(lessonId: number, teacherId: number) {
    const lesson = await this.findOneLessonById(lessonId);

    const teacher = await this.teacherRepository.findOne({
      where: { id: teacherId },
    });

    if (!teacher) throw new BadRequestException('Викладача не знайдено!');

    // Якщо дисципліна не об'єднана в потік
    if (!lesson.stream) {
      await this.groupLoadLessonsRepository.save({
        ...lesson,
        teacher: { id: teacherId },
      });

      return { lessonId, teacher };
    }

    // Якщо дисципліна об'єднана в потік
    await Promise.all(
      lesson.unitedWith.map(async (el) => {
        return await this.groupLoadLessonsRepository.save({
          id: el.id,
          teacher: { id: teacherId },
        });
      }),
    );

    return { lessonId, teacher };

    // const streamLesson = await this.groupLoadLessonsRepository.find({
    //   where: {
    //     stream: { id: lesson.stream.id },
    //     name: lesson.name,
    //     typeEn: lesson.typeEn,
    //     hours: lesson.hours,
    //     semester: lesson.semester,
    //     subgroupNumber: lesson.subgroupNumber,
    //   },
    // });

    // await Promise.all(
    //   streamLesson.map(async (el) => {
    //     return await this.groupLoadLessonsRepository.save({
    //       ...el,
    //       teacher: { id: teacherId },
    //     });
    //   }),
    // );

    // return { lessonId, teacher };
  }

  async unpinTeacher(lessonId: number) {
    const lesson = await this.findOneLessonById(lessonId);

    // Якщо дисципліна не об`єднана в потік
    if (!lesson.stream) {
      await this.groupLoadLessonsRepository.save({ ...lesson, teacher: null });
      return { lessonId };
    }

    // Якщо дисципліна об`єднана в потік
    await Promise.all(
      lesson.unitedWith.map(async (el) => {
        return await this.groupLoadLessonsRepository.save({
          id: el.id,
          teacher: null,
        });
      }),
    );

    return { lessonId };

    // const streamLesson = await this.groupLoadLessonsRepository.find({
    //   where: {
    //     stream: { id: lesson.stream.id },
    //     name: lesson.name,
    //     typeEn: lesson.typeEn,
    //     hours: lesson.hours,
    //     semester: lesson.semester,
    //     subgroupNumber: lesson.subgroupNumber,
    //   },
    // });

    // await Promise.all(
    //   streamLesson.map(async (el) => {
    //     return await this.groupLoadLessonsRepository.save({
    //       ...el,
    //       teacher: null,
    //     });
    //   }),
    // );
  }
}
