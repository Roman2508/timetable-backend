import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';

import { GradesEntity } from './entities/grade.entity';
import { UpdateGradesDto } from './dto/update-grades.dto';
import { CreateGradesDto } from './dto/create-grades.dto';

@Injectable()
export class GradesService {
  constructor(
    @InjectRepository(GradesEntity)
    private repository: Repository<GradesEntity>,
  ) {}

  // Коли студент додається до дисципліни - йому створюється grades entity
  create(dto: CreateGradesDto) {
    const grade = this.repository.create({ student: { id: dto.studentId }, gradeBook: { id: dto.gradeBookId } });
    return this.repository.save(grade);
  }

  // Коли викладач виставляє оцінку студенту
  async update(id: number, dto: UpdateGradesDto) {
    const grade = await this.repository.findOne({ where: { id } });

    if (!grade) throw new NotFoundException('Не вдалось оновити оцінку студенту');

    const isGradeExist = grade.grades.some((el) => el.lessonNumber === dto.lessonNumber);

    let updatedGrades = grade.grades;

    if (isGradeExist) {
      updatedGrades = updatedGrades.map((el) => {
        if (el.lessonNumber === dto.lessonNumber) {
          console.log(1, { ...el, ...dto });
          return { ...el, ...dto };
        } else {
          console.log(2, { ...el });
          return el;
        }
      });
    } else {
      updatedGrades.push(dto);
    }
    await this.repository.save({ id, grades: updatedGrades });
    return { id, grades: dto };
  }

  async findAll(year: number, semester: number, studentId: number) {
    const allGrades = await this.repository.find({
      where: { student: { id: studentId } },
      relations: { gradeBook: true, student: true },
    });

    const currentGrades = allGrades.map((el) => {
      if (el.gradeBook.year !== year || el.gradeBook.semester !== semester) return;
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
  async delete(studentId: number, lessonId: number) {
    const gradesToDelete = await this.repository.findOne({
      where: {
        student: { id: studentId },
        gradeBook: {
          lesson: {
            id: lessonId,
          },
        },
      },
    });

    if (!gradesToDelete) {
      throw new NotFoundException('Не знайдено');
    }

    await this.repository.remove(gradesToDelete);

    return lessonId;
  }
}
