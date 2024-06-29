import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';

import { GradeBookEntity } from './entities/grade-book.entity';
import { CreateGradeBookDto } from './dto/create-grade-book.dto';
import { UpdateGradeBookGradesDto } from './dto/update-grade-book-grades.dto';

@Injectable()
export class GradeBookService {
  constructor(
    @InjectRepository(GradeBookEntity)
    private repository: Repository<GradeBookEntity>,
  ) {}

  create(dto: CreateGradeBookDto) {
    const gradeBook = this.repository.create({
      group: { id: dto.groupId },
      lesson: { id: dto.lessonId },
      student: { id: dto.studentId },
      semester: dto.semester,
      year: dto.year,
      typeRu: dto.typeRu,
    });

    return this.repository.save(gradeBook);
  }

  findOne(year: number, semester: number, group: number, lesson: number, type: string) {
    return this.repository.find({
      where: {
        year,
        semester,
        typeRu: type,
        group: { id: group },
        lesson: { id: lesson },
      },
      relations: {
        group: true,
        lesson: true,
        student: true,
      },
      select: { group: { id: true, name: true }, student: { id: true, name: true }, lesson: { id: true, name: true } },
    });
  }

  async updateGrades(id: number, dto: UpdateGradeBookGradesDto) {
    const gradeBook = await this.repository.findOne({ where: { id } });

    if (!gradeBook) throw new NotFoundException('Не вдалось оновити оцінку студенту');

    const isGradeExist = gradeBook.grades.some((el) => el.lessonNumber === dto.lessonNumber);

    let updatedGrades = gradeBook.grades;

    if (isGradeExist) {
      updatedGrades = updatedGrades.map((el) => {
        if (el.lessonNumber === dto.lessonNumber) {
          return { ...el, ...dto };
        } else {
          return el;
        }
      });
    } else {
      updatedGrades.push(dto);
    }

    return this.repository.save({ id, grades: updatedGrades });
  }

  async remove(id: number) {
    const res = await this.repository.delete(id);

    if (res.affected === 0) {
      throw new NotFoundException('Не знайдено');
    }

    return id;
  }
}
