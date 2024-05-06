import { Between, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';

import { customDayjs } from 'src/utils/customDayjs';
import { StreamEntity } from 'src/streams/entities/stream.entity';
import { SettingsEntity } from 'src/settings/entities/setting.entity';
import { CopyDayOfScheduleDto } from './dto/copy-day-of-schedule.dto';
import { CopyWeekOfScheduleDto } from './dto/copy-week-of-schedule.dto';
import { ScheduleLessonsEntity } from './entities/schedule-lesson.entity';
import { CreateScheduleLessonDto } from './dto/create-schedule-lesson.dto';
import { UpdateScheduleLessonDto } from './dto/update-schedule-lesson.dto';
import { GoogleCalendarService } from 'src/google-calendar/google-calendar.service';
import { CreateReplacementDto } from './dto/create-replacement.dto';

@Injectable()
export class ScheduleLessonsService {
  constructor(
    private readonly googleCalendarService: GoogleCalendarService,

    @InjectRepository(ScheduleLessonsEntity)
    private repository: Repository<ScheduleLessonsEntity>,

    @InjectRepository(StreamEntity)
    private streamRepository: Repository<StreamEntity>,

    @InjectRepository(SettingsEntity)
    private settingsRepository: Repository<SettingsEntity>,
  ) {}

  async findOneByDateAndGroup(
    date: Date,
    lessonNumber: number,
    semester: number,
    groupId: number,
    typeRu: 'ЛК' | 'ПЗ' | 'ЛАБ' | 'СЕМ' | 'ЕКЗ',
  ) {
    return this.repository.findOne({
      where: { date, lessonNumber, semester, typeRu, group: { id: groupId } },
      relations: {
        group: true,
        teacher: true,
        stream: { groups: true },
        auditory: true,
        replacement: true,
      },
      select: {
        group: { id: true, name: true },
        teacher: {
          id: true,
          firstName: true,
          middleName: true,
          lastName: true,
        },
        replacement: {
          id: true,
          firstName: true,
          middleName: true,
          lastName: true,
        },
        auditory: { id: true, name: true },
        stream: { id: true, name: true, groups: { id: true, name: true } },
      },
    });
  }

  async findByTypeIdAndSemester(type: string, id: number, semesterStart?: string, semesterEnd?: string) {
    const start = semesterStart && customDayjs(semesterStart, 'MM.DD.YYYY').toDate();
    const end = semesterEnd && customDayjs(semesterEnd, 'MM.DD.YYYY').toDate();
    const date = start && end ? Between(start, end) : undefined;

    return this.repository.find({
      where: {
        [type]: { id },
        // semester: semester ? semester : undefined,
        date,
      },
      relations: {
        group: true,
        teacher: true,
        stream: { groups: true },
        auditory: true,
        replacement: true,
      },
      select: {
        group: { id: true, name: true },
        teacher: {
          id: true,
          firstName: true,
          middleName: true,
          lastName: true,
        },
        replacement: {
          id: true,
          firstName: true,
          middleName: true,
          lastName: true,
        },
        auditory: { id: true, name: true },
        stream: { id: true, name: true, groups: { id: true, name: true } },
      },
    });
  }

  async create(dto: CreateScheduleLessonDto) {
    // Спочатку треба перевірити чи в цей час та дату для цієї групи немає виставлених занять
    const lessonsOverlay = await this.repository.findOne({
      where: {
        date: dto.date,
        lessonNumber: dto.lessonNumber,
        semester: dto.semester,
        // group: { id: dto.group },
        teacher: { id: dto.teacher },
        // auditory: { id: dto.auditory },
      },
    });

    if (lessonsOverlay) {
      throw new BadRequestException('Можливі накладки занять');
    }

    // Перевіряю чи правильно передані дані
    // Має бути id аудиторії і isRemote: false АБО isRemote: true без id аудиторії
    if (!dto.auditory && !dto.isRemote) {
      throw new BadRequestException('Аудиторію не вибрано');
    }

    if (dto.auditory && dto.isRemote) {
      throw new BadRequestException('Урок який буде проводитись дистанційно не повинен займати аудиторію');
    }

    // Перевірити чи є потоки, якщо є - виставити для всіх груп в потоці
    if (dto.stream) {
      const stream = await this.streamRepository.findOne({
        where: { id: dto.stream },
        relations: { groups: true },
        select: { groups: { id: true, name: true } },
      });

      if (!stream) {
        throw new NotFoundException('Помилка при створенні елемента розкладу для потоку');
      }

      await Promise.all(
        stream.groups.map(async (el) => {
          const { group, teacher, auditory, stream, ...rest } = dto;

          const payload = {
            ...rest,
            group: { id: el.id },
            teacher: { id: teacher },
            stream: { id: stream },
          };

          const googleCalendarEventDto = {
            lessonName: dto.name,
            lessonNumber: dto.lessonNumber,
            date: dto.date,
            groupName: el.name,
            subgroupNumber: dto.subgroupNumber,
          };

          if (!auditory) {
            // Якщо урок буде проводитись дистанційно
            const newLesson = this.repository.create(payload);

            const groupEventDto = await this.googleCalendarService.getCalendarEventDto({
              ...googleCalendarEventDto,
              auditoryName: 'Дистанційно',
              itemId: el.id,
              type: 'group',
            });

            this.googleCalendarService.createCalendarEvent(groupEventDto);

            const teacherEventDto = await this.googleCalendarService.getCalendarEventDto({
              ...googleCalendarEventDto,
              auditoryName: 'Дистанційно',
              itemId: newLesson.teacher.id,
              type: 'teacher',
            });

            this.googleCalendarService.createCalendarEvent(teacherEventDto);

            return this.repository.save(newLesson);
          }

          // Якщо урок буде проводитись НЕ дистанційно
          const newLesson = this.repository.create({
            ...payload,
            auditory: { id: auditory },
          });

          await this.repository.save(newLesson);

          const createdLesson = await this.findOneByDateAndGroup(
            dto.date,
            dto.lessonNumber,
            dto.semester,
            el.id,
            dto.typeRu,
          );

          const groupEventDto = await this.googleCalendarService.getCalendarEventDto({
            ...googleCalendarEventDto,
            auditoryName: createdLesson.auditory.name,
            itemId: el.id,
            type: 'group',
          });

          this.googleCalendarService.createCalendarEvent(groupEventDto);

          const teacherEventDto = await this.googleCalendarService.getCalendarEventDto({
            ...googleCalendarEventDto,
            auditoryName: createdLesson.auditory.name,
            itemId: newLesson.teacher.id,
            type: 'teacher',
          });

          this.googleCalendarService.createCalendarEvent(teacherEventDto);

          return createdLesson;
        }),
      );

      const newLesson = await this.findOneByDateAndGroup(
        dto.date,
        dto.lessonNumber,
        dto.semester,
        dto.group,
        dto.typeRu,
      );

      return newLesson;
    }

    const { group, teacher, auditory, stream, ...rest } = dto;

    const payload = this.repository.create({
      ...rest,
      group: { id: group },
      teacher: { id: teacher },
      stream: { id: stream },
    });

    if (auditory) {
      // Якщо урок буде проводитись НЕ дистанційно
      const newLesson = this.repository.create({
        ...payload,
        auditory: { id: auditory },
      });

      await this.repository.save(newLesson);
    } else {
      // Якщо урок буде проводитись дистанційно
      const newLesson = this.repository.create(payload);
      await this.repository.save(newLesson);
    }

    const newLesson = await this.findOneByDateAndGroup(dto.date, dto.lessonNumber, dto.semester, dto.group, dto.typeRu);

    const createDtoPayload = {
      lessonName: newLesson.name,
      lessonNumber: newLesson.lessonNumber,
      date: newLesson.date,
      groupName: newLesson.group.name,
      subgroupNumber: newLesson.subgroupNumber,
      auditoryName: newLesson.auditory.name,
    };

    const teacherEventDto = await this.googleCalendarService.getCalendarEventDto({
      ...createDtoPayload,
      itemId: newLesson.teacher.id,
      type: 'teacher',
    });
    this.googleCalendarService.createCalendarEvent(teacherEventDto);

    const groupEventDto = await this.googleCalendarService.getCalendarEventDto({
      ...createDtoPayload,
      itemId: newLesson.group.id,
      type: 'group',
    });
    this.googleCalendarService.createCalendarEvent(groupEventDto);

    return newLesson;
  }

  async copyWeekOfSchedule(dto: CopyWeekOfScheduleDto) {
    const copyFromStart = customDayjs(dto.copyFromStartDay, { format: 'MM.DD.YYYY' });
    const copyFromEnd = customDayjs(copyFromStart).add(7, 'day');

    const copyToStart = customDayjs(dto.copyToStartDay, { format: 'MM.DD.YYYY' });

    if (!copyFromStart.isValid() || !copyToStart.isValid) {
      throw new BadRequestException('Не вірний формат дати');
    }

    const weekDifference = copyToStart.diff(copyFromStart, 'week');

    const lessons = await this.findByTypeIdAndSemester(
      'group',
      dto.groupId,
      copyFromStart.toString(),
      copyFromEnd.toString(),
    );

    if (!lessons.length) {
      return [];
    }

    const createdLessons = [];

    await Promise.all(
      lessons.map(async (lesson) => {
        const date = customDayjs(lesson.date, { format: 'MM.DD.YYYY' }).add(weekDifference, 'week').toDate();

        const { id, group, teacher, auditory, stream, ...rest } = lesson;

        const newLesson = await this.create({
          ...rest,
          group: group.id,
          stream: stream ? stream.id : null,
          teacher: teacher.id,
          auditory: auditory.id,
          date,
        });

        createdLessons.push(newLesson);
      }),
    );

    return createdLessons;
  }

  async copyDayOfSchedule(dto: CopyDayOfScheduleDto) {
    const copyFromStart = customDayjs(dto.copyFromDay, { format: 'YYYY.MM.DD' });

    const copyTo = customDayjs(dto.copyToDay, { format: 'MM.DD.YYYY' });

    if (!copyFromStart.isValid() || !copyTo.isValid) {
      throw new BadRequestException('Не вірний формат дати');
    }

    const daysDifference = copyTo.diff(copyFromStart, 'day');

    const lessons = await this.findByTypeIdAndSemester(
      'group',
      dto.groupId,
      copyFromStart.toString(),
      copyFromStart.toString(),
    );

    if (!lessons.length) {
      return [];
    }

    const createdLessons = [];

    await Promise.all(
      lessons.map(async (lesson) => {
        const date = customDayjs(lesson.date, { format: 'MM.DD.YYYY' }).add(daysDifference, 'day').toDate();

        const { id, group, teacher, auditory, stream, ...rest } = lesson;

        const newLesson = await this.create({
          ...rest,
          group: group.id,
          stream: stream ? stream.id : null,
          teacher: teacher.id,
          auditory: auditory.id,
          date,
        });

        createdLessons.push(newLesson);
      }),
    );

    return createdLessons;
  }

  async createReplacement(dto: CreateReplacementDto) {
    const lesson = await this.repository.findOne({ where: { id: dto.lessonId } });
    if (!lesson) throw new NotFoundException('Не знайдено');
    await this.repository.save({ ...lesson, replacement: { id: dto.teacherId } });

    const updatedLesson = await this.repository.findOne({
      where: { id: dto.lessonId },
      relations: { replacement: true },
      select: { replacement: { id: true, firstName: true, lastName: true, middleName: true } },
    });

    const replacementTeacher = updatedLesson.replacement;

    return replacementTeacher;
  }

  async deleteReplacement(id: number) {
    const lesson = await this.repository.findOne({ where: { id } });
    if (!lesson) throw new NotFoundException('Не знайдено');
    await this.repository.save({ ...lesson, replacement: null });
    return id;
  }

  async findAll(semester: number, type: string, id: number) {
    // dto: {type: 'group' | 'teacher' | 'auditory', id: ід групи, викладача або аудиторії, semester: номер семестру }

    const settings = await this.settingsRepository.findOne({
      where: { id: 1 },
    });
    if (!settings) throw new NotFoundException('Налаштування не знайдено');

    if (type === 'group' || type === 'teacher' || type === 'auditory') {
      // semester = 1 | 2
      const { firstSemesterStart, secondSemesterStart, firstSemesterEnd, secondSemesterEnd } = settings;

      const semesterStart = semester === 1 ? firstSemesterStart : secondSemesterStart;
      const semesterEnd = semester === 1 ? firstSemesterEnd : secondSemesterEnd;

      const data = await this.findByTypeIdAndSemester(type, id, semesterStart, semesterEnd);

      return data;
    }
  }

  // Оновити аудиторію для виставленого елемента розкладу
  async update(id: number, dto: UpdateScheduleLessonDto) {
    const lesson = await this.repository.findOne({
      where: { id },
      relations: {
        auditory: true,
        group: true,
        teacher: true,
        stream: { groups: true },
      },
      select: {
        auditory: { id: true, name: true },
        teacher: {
          id: true,
          calendarId: true,
          firstName: true,
          lastName: true,
          middleName: true,
        },
        group: { id: true, name: true, calendarId: true },
        stream: { id: true, name: true, groups: { id: true, name: true } },
      },
    });

    // Якщо група об`єднана в потік потрібно оновити аудиторію для всіх груп потоку

    if (!lesson) throw new NotFoundException('Не знайдено');

    // Перевіряю чи правильно передані дані
    // Має бути id аудиторії і isRemote: false АБО isRemote: true без id аудиторії
    if (!dto.auditoryId && !dto.isRemote) {
      throw new BadRequestException('Аудиторію не вибрано');
    }
    if (dto.auditoryId && dto.isRemote) {
      throw new BadRequestException('Урок який буде проводитись дистанційно не повинен займати аудиторію');
    }

    const updateGoogleCalendarEventDto = {
      lessonName: lesson.name,
      lessonNumber: lesson.lessonNumber,
      date: lesson.date,
      groupName: lesson.group.name,
      subgroupNumber: lesson.subgroupNumber,
      auditoryName: lesson.auditory ? lesson.auditory.name : 'Дистанційно',
    };

    // Якщо група об'єднана в потік і кількість груп в потоці більше 1
    if (lesson.stream && lesson.stream.groups.length > 1) {
      const currentsLessonDate = {
        date: lesson.date,
        lessonNumber: lesson.lessonNumber,
      };

      const streamLessonsInCurrentDate = await this.repository.find({
        where: {
          name: lesson.name,
          semester: lesson.semester,
          date: currentsLessonDate.date,
          stream: { id: lesson.stream.id },
          lessonNumber: currentsLessonDate.lessonNumber,
        },
        relations: {
          auditory: { category: true },
          group: true,
          teacher: true,
        },
        select: {
          auditory: {
            id: true,
            name: true,
            seatsNumber: true,
            category: { id: true, name: true },
          },
          group: { id: true, name: true, calendarId: true },
          teacher: { id: true, calendarId: true },
        },
      });

      Promise.all(
        streamLessonsInCurrentDate.map(async (el) => {
          const updateGroupEventDto = await this.googleCalendarService.getCalendarEventDto({
            ...updateGoogleCalendarEventDto,
            groupName: el.group.name,
            itemId: el.group.id,
            type: 'group',
          });

          // update group event
          this.googleCalendarService.updateCalendarEvent({
            calendarId: el.group.calendarId,
            summary: updateGroupEventDto.summary,
            description: updateGroupEventDto.description,
            location: dto.auditoryName ? dto.auditoryName : 'Дистанційно',
          });

          const updateTeacherEventDto = await this.googleCalendarService.getCalendarEventDto({
            ...updateGoogleCalendarEventDto,
            groupName: el.group.name,
            itemId: el.teacher.id,
            type: 'teacher',
          });

          // update teacher event
          this.googleCalendarService.updateCalendarEvent({
            calendarId: el.teacher.calendarId,
            summary: updateTeacherEventDto.summary,
            description: updateTeacherEventDto.description,
            location: dto.auditoryName ? dto.auditoryName : 'Дистанційно',
          });
        }),
      );

      // Якщо передано id аудиторії і isRemote = false - становлюю аудиторію для всіх груп в потоці
      if (dto.auditoryId && !dto.isRemote) {
        Promise.all(
          streamLessonsInCurrentDate.map(async (el) => {
            return this.repository.save({
              ...el,
              isRemote: false,
              auditory: { id: dto.auditoryId },
            });
          }),
        );
        //
      } else {
        Promise.all(
          streamLessonsInCurrentDate.map(async (el) => {
            return this.repository.save({
              ...el,
              isRemote: true,
              auditory: null,
            });
          }),
        );
      }

      if (dto.auditoryId) {
        return {
          id,
          isRemote: dto.isRemote,
          auditory: {
            id: dto.auditoryId,
            name: dto.auditoryName,
            seatsNumber: dto.seatsNumber,
          },
        };
        //
      } else {
        return {
          id,
          auditory: null,
          isRemote: dto.isRemote,
        };
      }
    }

    // Якщо група не об'єднана в потік
    const { auditory, isRemote, stream, ...rest } = lesson;

    const updateGroupEventDto = await this.googleCalendarService.getCalendarEventDto({
      ...updateGoogleCalendarEventDto,
      itemId: lesson.group.id,
      type: 'group',
    });

    // update group event
    this.googleCalendarService.updateCalendarEvent({
      calendarId: lesson.group.calendarId,
      summary: updateGroupEventDto.summary,
      description: updateGroupEventDto.description,
      location: dto.auditoryName ? dto.auditoryName : 'Дистанційно',
    });

    const updateTeacherEventDto = await this.googleCalendarService.getCalendarEventDto({
      ...updateGoogleCalendarEventDto,
      itemId: lesson.teacher.id,
      type: 'teacher',
    });

    // update teacher event
    this.googleCalendarService.updateCalendarEvent({
      calendarId: lesson.teacher.calendarId,
      summary: updateTeacherEventDto.summary,
      description: updateTeacherEventDto.description,
      location: dto.auditoryName ? dto.auditoryName : 'Дистанційно',
    });

    // Якщо дисципліна читається аудиторно
    if (dto.auditoryId) {
      return this.repository.save({
        ...rest,
        isRemote: dto.isRemote,
        auditory: {
          id: dto.auditoryId,
          name: dto.auditoryName,
          seatsNumber: dto.seatsNumber,
        },
      });
    } else {
      // Якщо дисципліна читається дистанційно
      return this.repository.save({
        ...rest,
        isRemote: dto.isRemote,
        auditory: null,
      });
    }
  }

  async getAuditoryOverlay(_date: string, lessonNumber: number, auditoryId: number) {
    if (!customDayjs(_date).isValid()) {
      throw new BadRequestException('Не вірний формат дати');
    }

    const date = customDayjs(_date, 'YYYY.MM.DD').format('YYYY-MM-DD 00:00:00');

    const lessons = await this.repository.find({
      // @ts-ignore
      where: { date, lessonNumber },
      relations: { auditory: true },
      select: { auditory: { id: true, name: true } },
    });

    const auditories = lessons.map((el) => el.auditory);

    return auditories.filter((el) => {
      // !el === дистанційно
      if (!el) return true;
      return el.id !== auditoryId;
    });
  }

  async getTeacherOverlay(_date: string, lessonNumber: number) {
    if (!customDayjs(_date).isValid()) {
      throw new BadRequestException('Не вірний формат дати');
    }

    const date = customDayjs(_date, 'YYYY.MM.DD').format('YYYY-MM-DD 00:00:00');

    const lessons = await this.repository.find({
      // @ts-ignore
      where: { date, lessonNumber },
      relations: { teacher: true },
      select: { teacher: { id: true, firstName: true, lastName: true, middleName: true } },
    });

    const auditories = lessons.map((el) => el.teacher);

    return auditories;
  }

  async remove(id: number) {
    const lesson = await this.repository.findOne({
      where: { id },
      relations: {
        group: true,
        teacher: true,
        auditory: true,
        stream: { groups: true },
      },
      select: {
        teacher: { id: true, calendarId: true },
        group: { id: true, name: true, calendarId: true },
        auditory: { id: true, name: true },
        stream: { id: true, name: true, groups: { id: true, name: true } },
      },
    });

    if (!lesson) throw new NotFoundException('Не знайдено');

    // Якщо група об'єднана в потік і кількість груп в потоці більше 1
    if (lesson.stream && lesson.stream.groups.length > 1) {
      const currentsLessonDate = {
        date: lesson.date,
        lessonNumber: lesson.lessonNumber,
      };

      const streamLessonsInCurrentDate = await this.repository.find({
        where: {
          name: lesson.name,
          semester: lesson.semester,
          date: currentsLessonDate.date,
          stream: { id: lesson.stream.id },
          lessonNumber: currentsLessonDate.lessonNumber,
        },
        relations: {
          group: true,
          teacher: true,
        },
        select: {
          group: { id: true, name: true, calendarId: true },
          teacher: { id: true, calendarId: true },
        },
      });

      const deleteGoogleCalendarEventDto = {
        lessonName: lesson.name,
        lessonNumber: lesson.lessonNumber,
        date: lesson.date,
        subgroupNumber: lesson.subgroupNumber,
        auditoryName: lesson.auditory ? lesson.auditory.name : 'Дистанційно',
      };

      // Потрібно перевіряти чи були видалені елементи, якщо ні - повернути помилку !!!!!

      Promise.all(
        streamLessonsInCurrentDate.map(async (el) => {
          this.googleCalendarService.deleteCalendarEvent(el.group.calendarId, {
            ...deleteGoogleCalendarEventDto,
            groupName: el.group.name,
            itemId: el.group.id,
            type: 'group',
          });

          this.googleCalendarService.deleteCalendarEvent(el.teacher.calendarId, {
            ...deleteGoogleCalendarEventDto,
            groupName: el.group.name,
            itemId: el.teacher.id,
            type: 'teacher',
          });

          const res = await this.repository.delete({ id: el.id });

          if (res.affected === 0) {
            throw new NotFoundException('Не знайдено');
          }
        }),
      );

      return id;
    }

    // Якщо дисипліна не об'єднана в потік
    const deleteGoogleCalendarEventDto = {
      lessonName: lesson.name,
      lessonNumber: lesson.lessonNumber,
      date: lesson.date,
      groupName: lesson.group.name,
      subgroupNumber: lesson.subgroupNumber,
      auditoryName: lesson.auditory ? lesson.auditory.name : 'Дистанційно',
    };

    this.googleCalendarService.deleteCalendarEvent(lesson.group.calendarId, {
      ...deleteGoogleCalendarEventDto,
      itemId: lesson.group.id,
      type: 'group',
    });

    this.googleCalendarService.deleteCalendarEvent(lesson.teacher.calendarId, {
      ...deleteGoogleCalendarEventDto,
      itemId: lesson.teacher.id,
      type: 'teacher',
    });

    const res = await this.repository.delete({ id });

    if (res.affected === 0) {
      throw new NotFoundException('Не знайдено');
    }

    return id;
  }
}
