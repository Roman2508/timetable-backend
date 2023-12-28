import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAuditoryDto } from './dto/create-auditory.dto';
import { UpdateAuditoryDto } from './dto/update-auditory.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { AuditoryEntity } from './entities/auditory.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AuditoriesService {
  constructor(
    @InjectRepository(AuditoryEntity)
    private repository: Repository<AuditoryEntity>,
  ) {}

  // findAll() {
  //   return this.repository.find({ relations: { category: true } });
  // }

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

    return this.repository.save({
      ...category,
      name: dto.name,
      seatsNumber: dto.seatsNumber,
      category: { id: dto.category },
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
