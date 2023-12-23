import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateScheduleLessonDto } from './dto/create-schedule-lesson.dto';
import { UpdateScheduleLessonDto } from './dto/update-schedule-lesson.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ScheduleLessonsEntity } from './entities/schedule-lesson.entity';

@Injectable()
export class ScheduleLessonsService {
  constructor(
    @InjectRepository(ScheduleLessonsEntity)
    private repository: Repository<ScheduleLessonsEntity>,
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

  async update(id: number, dto: UpdateScheduleLessonDto) {
    const lessons = await this.repository.findOne({
      where: { id },
      relations: {
        group: true,
        teacher: true,
        stream: true,
      },
    });
    // Якщо група об`єднана в потік потрібно оновити аудиторію для всіх груп потоку
    const { group, teacher, auditory, stream, ...rest } = lessons;

    return this.repository.save({
      ...rest,
      auditory: { id: dto.auditory },
    });
  }

  remove(id: number) {
    return `This action removes a #${id} scheduleLesson`;
  }
}
