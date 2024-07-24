import { Repository } from 'typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { InstructionalMaterialEnity } from './entities/instructional-material.entity';
import { CreateInstructionalMaterialDto } from './dto/create-instructional-material.dto';
import { UpdateInstructionalMaterialDto } from './dto/update-instructional-material.dto';

@Injectable()
export class InstructionalMaterialsService {
  constructor(
    @InjectRepository(InstructionalMaterialEnity)
    private repository: Repository<InstructionalMaterialEnity>,
  ) {}

  create(dto: CreateInstructionalMaterialDto) {
    const newMaterial = { name: dto.name, lessonNumber: dto.lessonNumber, lesson: { id: dto.lessonId } };
    const plansCategory = this.repository.create(newMaterial);
    return this.repository.save(plansCategory);
  }

  find(id: number) {
    return this.repository.find({
      where: { lesson: { id } },
      relations: { lesson: true },
      select: { id: true, name: true, lessonNumber: true, lesson: { id: true, name: true } },
    });
  }

  async update(id: number, dto: UpdateInstructionalMaterialDto) {
    const matherial = await this.repository.findOne({ where: { id } });
    if (!matherial) throw new NotFoundException('Не знайдено');
    return this.repository.save({ ...matherial, name: dto.name });
  }

  async remove(id: number) {
    const res = await this.repository.delete(id);
    if (res.affected === 0) throw new NotFoundException('Не знайдено');
    return id;
  }
}
