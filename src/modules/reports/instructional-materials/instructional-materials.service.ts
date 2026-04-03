import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';

import { InstructionalMaterialEnity } from './entities/instructional-material.entity';
import { CreateInstructionalMaterialDto } from './dto/create-instructional-material.dto';
import { UpdateInstructionalMaterialDto } from './dto/update-instructional-material.dto';
import { ImportInstructionalMaterialDto } from './dto/import-instructional-material.dto';

@Injectable()
export class InstructionalMaterialsService {
  constructor(
    @InjectRepository(InstructionalMaterialEnity)
    private repository: Repository<InstructionalMaterialEnity>,
  ) {}

  create(dto: CreateInstructionalMaterialDto) {
    const newMaterial = {
      name: dto.name,
      lessonNumber: dto.lessonNumber,
      year: dto.year,
      lesson: { id: dto.lessonId },
    };
    const plansCategory = this.repository.create(newMaterial);
    return this.repository.save(plansCategory);
  }

  find(id: number, year: number) {
    return this.repository.find({
      where: { lesson: { id }, year },
      relations: { lesson: true },
      select: { id: true, name: true, lessonNumber: true, lesson: { id: true, name: true } },
    });
  }

  async update(id: number, dto: UpdateInstructionalMaterialDto) {
    const matherial = await this.repository.findOne({ where: { id } });
    if (!matherial) throw new NotFoundException('Не знайдено');
    return this.repository.save({ ...matherial, name: dto.name });
  }

  async importFromFile(dto: ImportInstructionalMaterialDto) {
    const themes = await this.repository.find({ where: { lesson: { id: dto.lessonId }, year: dto.year } });
    if (!dto.themes) throw new NotFoundException('Теми не знайдено');

    const newThemes = await Promise.all(
      dto.themes.map(async (el) => {
        const existedTheme = themes.find((t) => t.lessonNumber === el.lessonNumber);

        // Якщо теми немає - створюю
        if (!existedTheme) {
          const payload = { name: el.name, lessonNumber: el.lessonNumber, lessonId: dto.lessonId, year: dto.year };
          return this.create(payload);
        }

        // Якщо тема є і її назва не змінилась
        if (existedTheme.name === el.name) {
          return existedTheme;
        }

        // Якщо назва теми змінилась
        return await this.update(existedTheme.id, { name: el.name });
      }),
    );

    return newThemes;
  }

  async remove(id: number) {
    const res = await this.repository.delete(id);
    if (res.affected === 0) throw new NotFoundException('Не знайдено');
    return id;
  }
}
