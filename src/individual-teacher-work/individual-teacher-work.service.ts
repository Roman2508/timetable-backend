import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateIndividualTeacherWorkDto } from './dto/create-individual-teacher-work.dto';
import { UpdateIndividualTeacherWorkDto } from './dto/update-individual-teacher-work.dto';
import { Repository } from 'typeorm';
import { IndividualTeacherWorkEntity } from './entities/individual-teacher-work.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class IndividualTeacherWorkService {
  constructor(
    @InjectRepository(IndividualTeacherWorkEntity)
    private repository: Repository<IndividualTeacherWorkEntity>,
  ) {}

  create(dto: CreateIndividualTeacherWorkDto) {
    console.log(dto);
    const entity = this.repository.create(dto);
    return this.repository.save(entity);
  }

  findAll() {
    return this.repository.find();
  }

  findOne(id: number) {
    return `This action returns a #${id} individualTeacherWork`;
  }

  async update(id: number, dto: UpdateIndividualTeacherWorkDto) {
    const updatedEntity = await this.repository.update({ id }, dto);
    return updatedEntity;
  }

  async remove(id: number) {
    const res = await this.repository.delete(id);

    if (res.affected === 0) {
      throw new NotFoundException('Не знайдено');
    }

    return id;
  }
}
