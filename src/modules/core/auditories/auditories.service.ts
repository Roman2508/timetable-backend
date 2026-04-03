import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';

import { AuditoryEntity } from './entities/auditory.entity';
import { CreateAuditoryDto } from './dto/create-auditory.dto';
import { UpdateAuditoryDto } from './dto/update-auditory.dto';

@Injectable()
export class AuditoriesService {
  constructor(
    @InjectRepository(AuditoryEntity)
    private repository: Repository<AuditoryEntity>,
  ) {}

  findOne(id: number) {
    return this.repository.findOne({ where: { id }, relations: { category: true } });
  }

  create(dto: CreateAuditoryDto) {
    const { category, ...rest } = dto;

    const newAuditory = this.repository.create({
      ...rest,
      category: { id: category },
    });

    return this.repository.save(newAuditory);
  }

  async update(id: number, dto: UpdateAuditoryDto) {
    const category = await this.repository.findOne({
      where: { id },
      relations: { category: true },
    });

    if (!category) {
      throw new NotFoundException('Не знайдено');
    }

    await this.repository.save({
      ...category,
      name: dto.name,
      status: dto.status,
      seatsNumber: dto.seatsNumber,
      category: { id: dto.category },
    });

    const updatedCategory = await this.repository.findOne({
      where: { id },
      relations: { category: true },
      select: { category: { id: true, name: true } },
    });

    return updatedCategory;
  }

  async remove(id: number) {
    const res = await this.repository.delete(id);

    if (res.affected === 0) {
      throw new NotFoundException('Не знайдено');
    }

    return id;
  }
}
