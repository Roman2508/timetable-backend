import { DeepPartial, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

import { GradeBookEntity } from './entities/grade-book.entity';
import { CreateGradeBookDto } from './dto/create-grade-book.dto';
import { AddSummaryDto } from './dto/add-summary.dto';
import { DeleteSummaryDto } from './dto/delete-summary.dto';
import { GroupLoadLessonEntity } from 'src/group-load-lessons/entities/group-load-lesson.entity';

@Injectable()
export class GradeBookService {
  constructor(
    @InjectRepository(GradeBookEntity)
    private repository: Repository<GradeBookEntity>,
  ) {}

  // Коли при створенні групи для неї вперше прикріплюється навчальний план - створюю для всіх дисциплін плану електронний журнал
  // Або коли для групи прикріплюється інший (відмінний від попереднього) план
  // Треба споатку видалити всі grade-book старого плану (за це відповідає removeAll())
  // Потім створити всі нові grade-book для нового плану (за це відповідає createAll())

  // 1 дисципліна та 1 вид навантаження (ЛК, ПЗ, ЛАБ і т.д.) === 1 журнал
  // Тобто якщо 1 дисципліна навчального плану має лекції і пз то для неї створюється 2 журнала
  async createAll(dto: CreateGradeBookDto) {
    const allLessons = dto.groupLoadLessons ? dto.groupLoadLessons : [];

    const lessons = allLessons.filter(
      (el) => el.typeRu === 'ЛК' || el.typeRu === 'ПЗ' || el.typeRu === 'ЛАБ' || el.typeRu === 'СЕМ',
    );

    const gradeBooks = Promise.all(
      lessons.map(async (el: DeepPartial<GroupLoadLessonEntity>) => {
        const gradeBookPayload = {
          group: { id: dto.groupId },
          lesson: { id: el.id },
          semester: el.semester,
          typeRu: el.typeRu,
        };

        const newObj = this.repository.create(gradeBookPayload);
        const newGradeBook = await this.repository.save(newObj);
        return newGradeBook;
      }),
    );

    return gradeBooks;
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

  findOne(semester: number, group: number, lesson: number, type: string) {
    return this.repository.find({
      where: {
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

  async deleteAll(groupId: number) {
    await this.repository.delete({
      group: { id: groupId },
    });
    return true;
  }

  async remove(id: number) {
    const res = await this.repository.delete(id);

    if (res.affected === 0) {
      throw new NotFoundException('Не знайдено');
    }

    return id;
  }
}
