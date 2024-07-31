import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';

import { IndividualTeacherWorkEntity } from './entities/individual-teacher-work.entity';
import { CreateIndividualTeacherWorkDto } from './dto/create-individual-teacher-work.dto';
import { UpdateIndividualTeacherWorkDto } from './dto/update-individual-teacher-work.dto';

@Injectable()
export class IndividualTeacherWorkService {
  constructor(
    @InjectRepository(IndividualTeacherWorkEntity)
    private repository: Repository<IndividualTeacherWorkEntity>,
  ) {}

  create(dto: CreateIndividualTeacherWorkDto) {
    const entity = this.repository.create(dto);
    return this.repository.save(entity);
  }

  findAll() {
    return this.repository.find();
  }

  async update(id: number, dto: UpdateIndividualTeacherWorkDto) {
    const entity = await this.repository.findOne({ where: { id } });
    if (!entity) throw new NotFoundException('Не знайдено');
    return this.repository.save({ ...entity, ...dto });
  }

  async remove(id: number) {
    const res = await this.repository.delete(id);

    if (res.affected === 0) {
      throw new NotFoundException('Не знайдено');
    }

    return id;
  }
}
