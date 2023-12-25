import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { ScheduleLessonsEntity } from './entities/schedule-lesson.entity';
import { CreateScheduleLessonDto } from './dto/create-schedule-lesson.dto';
import { UpdateScheduleLessonDto } from './dto/update-schedule-lesson.dto';
import { StreamEntity } from 'src/streams/entities/stream.entity';

@Injectable()
export class ScheduleLessonsService {
  constructor(
    @InjectRepository(ScheduleLessonsEntity)
    private repository: Repository<ScheduleLessonsEntity>,

    @InjectRepository(StreamEntity)
    private streamRepository: Repository<StreamEntity>,
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

      // Можливо el.group.id === undefined !!!!!!!!!!!!!!!!!!!!!
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

  async findAll(semester: number, type: string, id: number) {
    // dto: {type: 'group' | 'teacher' | 'auditory', id: ід групи, викладача або аудиторії, semester: номер семестру }
    const lessons = await this.repository.find({
      where: {
        [type]: { id },
        semester: semester,
      },
    });

    return lessons;
  }

  // findOne(id: number) {
  //   return `This action returns a #${id} scheduleLesson`;
  // }

  // Оновити аудиторію для виставленого елемента розкладу
  async update(id: number, dto: UpdateScheduleLessonDto) {
    const lesson = await this.repository.findOne({
      where: { id },
      relations: {
        group: true,
        teacher: true,
        stream: true,
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
      });

      Promise.all(
        streamLessonsInCurrentDate.map(async (el) => {
          return this.repository.save({
            ...el,
            auditory: { id: dto.auditory },
          });
        }),
      );

      return streamLessonsInCurrentDate.find((el) => el.id === id)[0];
    }

    // Якщо група не об'єднана в потік
    const { group, teacher, auditory, stream, ...rest } = lesson;

    return this.repository.save({
      ...rest,
      auditory: { id: dto.auditory },
    });
  }

  async remove(id: number) {
    const lesson = await this.repository.findOne({
      where: { id },
      relations: {
        stream: true,
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
      // return streamLessonsInCurrentDate.find((el) => el.id === id)[0];
    }

    // Якщо дисипліна не об'єднана в потік
    const res = await this.repository.delete({ id });

    if (res.affected === 0) {
      throw new NotFoundException('Не знайдено');
    }

    return id;
  }
}
