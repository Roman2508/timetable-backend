import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

import { GradeBookEntity } from './entities/grade-book.entity';
import { CreateGradeBookDto } from './dto/create-grade-book.dto';
import { AddSummaryDto } from './dto/add-summary.dto';
import { DeleteSummaryDto } from './dto/delete-summary.dto';

@Injectable()
export class GradeBookService {
  constructor(
    @InjectRepository(GradeBookEntity)
    private repository: Repository<GradeBookEntity>,
  ) {}

  // 1 дисципліна та 1 вид навантаження (ЛК, ПЗ, ЛАБ і т.д.) === 1 журнал
  // Тобто якщо 1 дисципліна навчального плану має лекції і пз то для неї створюється 2 журнала
  create(dto: CreateGradeBookDto) {
    const gradeBook = this.repository.create({
      group: { id: dto.groupId },
      lesson: { id: dto.lessonId },
      semester: dto.semester,
      year: dto.year,
      typeRu: dto.typeRu,
    });

    return this.repository.save(gradeBook);
  }

  async addSummary(id: number, dto: AddSummaryDto) {
    const gradeBook = await this.repository.findOne({ where: { id } });
    const isPossibleToAdd = gradeBook.summary.some((el) => el.afterLesson === dto.afterLesson);

    if (isPossibleToAdd) throw new BadRequestException('Неможливо додати підсумок');

    const summary = [...gradeBook.summary, dto];
    return this.repository.save({ id, summary });
  }

  async deleteSummary(id: number, dto: DeleteSummaryDto) {
    const gradeBook = await this.repository.findOne({ where: { id } });
    const summary = gradeBook.summary.filter((el) => el.afterLesson !== dto.afterLesson || el.type !== dto.type);
    return this.repository.save({ id, summary });
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
      },
      select: { group: { id: true, name: true }, lesson: { id: true, name: true } },
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
