import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Between, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { GroupEntity } from 'src/groups/entities/group.entity';
import { StreamEntity } from 'src/streams/entities/stream.entity';
import { ScheduleLessonsEntity } from './entities/schedule-lesson.entity';
import { CreateScheduleLessonDto } from './dto/create-schedule-lesson.dto';
import { UpdateScheduleLessonDto } from './dto/update-schedule-lesson.dto';
import { SettingsEntity } from 'src/settings/entities/setting.entity';
import { getCurrentSemester } from './helpers/getCurrentSemester';
import dayjs from 'dayjs';

@Injectable()
export class ScheduleLessonsService {
  constructor(
    @InjectRepository(ScheduleLessonsEntity)
    private repository: Repository<ScheduleLessonsEntity>,

    @InjectRepository(StreamEntity)
    private streamRepository: Repository<StreamEntity>,

    @InjectRepository(GroupEntity)
    private groupsRepository: Repository<GroupEntity>,

    @InjectRepository(SettingsEntity)
    private settingsRepository: Repository<SettingsEntity>,
  ) {}

  async create(dto: CreateScheduleLessonDto) {
    // Спочатку треба перевірити чи в цей час та дату для цієї групи немає виставлених занять
    const lessonsOverlay = await this.repository.findOne({
      where: {
        date: dto.date,
        lessonNumber: dto.lessonNumber,
        semester: dto.semester,
        group: { id: dto.group },
        // teacher: { id: dto.teacher },
        // auditory: { id: dto.auditory },
      },
    });

    if (lessonsOverlay) {
      throw new BadRequestException('Можливі накладки занять');
    }

    // Перевірити чи є потоки, якщо є - виставити для всіх груп в потоці
    if (dto.stream) {
      const stream = await this.streamRepository.findOne({
        where: { id: dto.stream },
        relations: { groups: true },
        select: { groups: { id: true } },
      });

      if (!stream) {
        throw new NotFoundException(
          'Помилка при створенні елемента розкладу для потоку',
        );
      }

      const newLessons = await Promise.all(
        stream.groups.map(async (el) => {
          const { group, teacher, auditory, stream, ...rest } = dto;

          const newLesson = this.repository.create({
            ...rest,
            group: { id: el.id },
            teacher: { id: teacher },
            auditory: { id: auditory },
            stream: { id: stream },
          });

          return this.repository.save(newLesson);
        }),
      );

      return newLessons.find((el) => el.group.id === dto.group);
    }

    const { group, teacher, auditory, stream, ...rest } = dto;

    const newLesson = this.repository.create({
      ...rest,
      group: { id: group },
      teacher: { id: teacher },
      auditory: { id: auditory },
      stream: { id: stream },
    });

    return this.repository.save(newLesson);
  }

  async findByTypeIdAndSemester(
    type: string,
    id: number,
    semester?: number,
    year?: number,
  ) {
    const startOfYear = year && dayjs(year).startOf('year').toDate();
    const endOfYear = year && dayjs(year).endOf('year').toDate();

    const date =
      startOfYear && endOfYear ? Between(startOfYear, endOfYear) : undefined;

    return this.repository.find({
      where: {
        [type]: { id },
        semester: semester ? semester : undefined,
        date,
      },
      relations: {
        group: true,
        teacher: true,
        stream: { groups: true },
        auditory: true,
      },
      select: {
        group: { id: true, name: true },
        teacher: {
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

  async findAll(semester: number, type: string, id: number) {
    // dto: {type: 'group' | 'teacher' | 'auditory', id: ід групи, викладача або аудиторії, semester: номер семестру }

    const settings = await this.settingsRepository.findOne({
      where: { id: 1 },
    });
    if (!settings) throw new NotFoundException('Налаштування не знайдено');

    if (type === 'group') {
      const group = await this.groupsRepository.findOne({ where: { id } });
      if (!group) throw new NotFoundException('Групу не знайдено');

      const currentSemester = getCurrentSemester(
        settings.firstSemesterStart,
        semester,
        group.yearOfAdmission,
      );

      if (!currentSemester)
        throw new BadRequestException('Семестр не знайдено');

      return await this.findByTypeIdAndSemester(type, id, currentSemester);
    }

    if (type === 'teacher') {
      // semester = 1 | 2
      const first = settings.firstSemesterStart;
      const second = settings.secondSemesterStart;
      const firstDate = semester === 1 ? first : second;

      const year = Number(firstDate.split('-')[0]);

      return await this.findByTypeIdAndSemester(type, id, undefined, year);

      // const showedSemesterYear = Number(showedSemesterStart.split('-')[0]);
      // const currentSemester = getCurrentSemester(
      //   settings.firstSemesterStart,
      //   semester,
      //   showedSemesterYear,
      // );
      // return await this.findByTypeIdAndSemester(
      //   semester,
      //   type,
      //   id,
      //   showedSemesterYear,
      // );
    }

    if (type === 'auditory') {
      return;
    }
  }

  // findOne(id: number) {
  //   return `This action returns a #${id} scheduleLesson`;
  // }

  // Оновити аудиторію для виставленого елемента розкладу
  async update(id: number, dto: UpdateScheduleLessonDto) {
    const lesson = await this.repository.findOne({
      where: { id },
      relations: {
        auditory: true,
        stream: { groups: true },
      },
      select: {
        auditory: { id: true },
        stream: { id: true, name: true, groups: { id: true, name: true } },
      },
    });

    // Якщо група об`єднана в потік потрібно оновити аудиторію для всіх груп потоку

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
          auditory: { category: true },
        },
        select: {
          auditory: {
            id: true,
            name: true,
            seatsNumber: true,
            category: { id: true, name: true },
          },
        },
      });

      Promise.all(
        streamLessonsInCurrentDate.map(async (el) => {
          return this.repository.save({
            ...el,
            auditory: { id: dto.auditory },
          });
        }),
      );

      const updatedItem = streamLessonsInCurrentDate.find((el) => el.id === id);

      return {
        id: updatedItem.id,
        auditory: {
          ...updatedItem.auditory,
        },
      };
    }

    // Якщо група не об'єднана в потік
    const { auditory, stream, ...rest } = lesson;

    return this.repository.save({
      ...rest,
      auditory: { id: dto.auditory },
    });
  }

  async remove(id: number) {
    const lesson = await this.repository.findOne({
      where: { id },
      relations: {
        auditory: true,
        stream: { groups: true },
      },
      select: {
        auditory: { id: true },
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
      });

      // Потрібно перевіряти чи були видалені елементи, якщо ні - повернути помилку !!!!!

      Promise.all(
        streamLessonsInCurrentDate.map(async (el) => {
          const res = await this.repository.delete({ id: el.id });

          if (res.affected === 0) {
            throw new NotFoundException('Не знайдено');
          }
        }),
      );

      return id;
    }

    // Якщо дисипліна не об'єднана в потік
    const res = await this.repository.delete({ id });

    if (res.affected === 0) {
      throw new NotFoundException('Не знайдено');
    }

    return id;
  }
}
