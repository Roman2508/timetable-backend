import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';

import { TeacherEntity } from './entities/teacher.entity';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { GoogleCalendarService } from 'src/google-calendar/google-calendar.service';

@Injectable()
export class TeachersService {
  constructor(
    private readonly googleCalendarService: GoogleCalendarService,

    @InjectRepository(TeacherEntity)
    private repository: Repository<TeacherEntity>,
  ) {}

  findAll() {
    return this.repository.find({
      relations: {
        category: true,
      },
    });
  }

  async create(dto: CreateTeacherDto) {
    const owner = `${dto.lastName} ${dto.firstName[0]}. ${dto.middleName[0]}. `;

    const calendarId = await this.googleCalendarService.createCalendar({
      owner,
    });

    const newTeacher = this.repository.create({
      firstName: dto.firstName,
      middleName: dto.middleName,
      lastName: dto.lastName,
      category: { id: dto.category },
      calendarId,
    });

    return this.repository.save(newTeacher);
  }

  async update(id: number, dto: UpdateTeacherDto) {
    const teacher = await this.repository.findOne({
      where: { id },
      relations: { category: true },
    });

    if (!teacher) {
      throw new NotFoundException();
    }

    const isFirstNameDifferent = teacher.firstName !== dto.firstName;
    const isMiddleNameDifferent = teacher.middleName !== dto.middleName;
    const isLastNameDifferent = teacher.lastName !== dto.lastName;

    // Якщо змінилось ім'я, прізвище або побатькові - переіменовую гугл календар
    if (isFirstNameDifferent || isMiddleNameDifferent || isLastNameDifferent) {
      const owner = `${dto.lastName} ${dto.firstName[0]}. ${dto.middleName[0]}. `;

      await this.googleCalendarService.updateCalendar({
        calendarId: teacher.calendarId,
        owner,
      });
    }

    const { category, ...rest } = dto;

    return this.repository.save({
      ...teacher,
      ...rest,
      category: { id: category },
    });
  }

  async remove(id: number) {
    const res = await this.repository.delete(id);

    if (res.affected === 0) {
      throw new NotFoundException('Не знайдено');
    }

    return id;
  }
}
