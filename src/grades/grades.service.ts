import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

import { GradesEntity } from './entities/grade.entity';
import { DeleteGradesDto } from './dto/delete-grades.dto';
import { UpdateGradesDto } from './dto/update-grades.dto';
import { CreateGradesDto } from './dto/create-grades.dto';
import { GradeBookEntity } from 'src/grade-book/entities/grade-book.entity';

@Injectable()
export class GradesService {
  constructor(
    @InjectRepository(GradesEntity)
    private repository: Repository<GradesEntity>,

    @InjectRepository(GradeBookEntity)
    private gradeBookRepository: Repository<GradeBookEntity>,
  ) {}

  // Коли студент додається до дисципліни - йому створюється grades entity
  async create(dto: CreateGradesDto) {
    const gradeBook = await this.gradeBookRepository.findOne({ where: { lesson: { id: dto.lessonId } } });

    if (!gradeBook) throw new NotFoundException('Дисципліну не знайдено');

    const grades = await Promise.allSettled(
      dto.studentIds.map(async (id) => {
        const existedStudent = await this.repository.findOne({ where: { id } });

        if (existedStudent) throw new BadRequestException('Студент вже вивчає цю дисципліну');

        const grade = this.repository.create({ student: { id }, gradeBook: { id: gradeBook.id } });
        const res = await this.repository.save(grade);
        return res;
      }),
    );

    return grades;
  }

  // Коли викладач виставляє оцінку студенту
  async update(id: number, dto: UpdateGradesDto) {
    if (dto.rating < 0) throw new BadRequestException("Оцінка не може бути від'ємним значенням");

    const grade = await this.repository.findOne({ where: { id } });

    if (!grade) throw new NotFoundException('Не вдалось оновити оцінку студенту');

    const isGradeExist = grade.grades.some((el) => el.lessonNumber === dto.lessonNumber);

    let updatedGrades = grade.grades;

    if (isGradeExist) {
      updatedGrades = updatedGrades.map((el) => {
        if (el.lessonNumber === dto.lessonNumber) {
          return { ...el, ...dto };
        } else {
          return el;
        }
      });
      updatedGrades = updatedGrades.filter((el) => el.isAbsence !== false || el.rating !== 0);
    } else {
      updatedGrades.push(dto);
    }
    await this.repository.save({ id, grades: updatedGrades });
    return { id, grades: dto };
  }

  async findAll(semester: number, studentId: number) {
    const allGrades = await this.repository.find({
      where: { student: { id: studentId } },
      relations: { gradeBook: true, student: true },
    });

    const currentGrades = allGrades.map((el) => {
      if (el.gradeBook.semester !== semester) return;
      else return el;
    });

    const filteredGrades = currentGrades.filter((item) => item !== null);

    const shortGrades = filteredGrades.map((el) => {
      if (el) {
        return {
          id: el.id,
          grades: el.grades,
          student: { id: el.student.id, name: el.student.name },
          gradeBook: { id: el.gradeBook.id },
        };
      }
    });

    return shortGrades;
  }

  // Коли студент відкріплюється від дисипліни - видаляється його журнал з цієї дисципліни
  async delete(dto: DeleteGradesDto) {
    await Promise.allSettled(
      dto.studentIds.map(async (id) => {
        const grade = await this.repository.findOne({
          where: { student: { id }, gradeBook: { lesson: { id: dto.lessonId } } },
        });

        if (!grade) return;
        await this.repository.delete({ id: grade.id });
      }),
    );
    return dto;
  }
}
