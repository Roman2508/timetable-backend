import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { TeacherEntity } from './entities/teacher.entity';
import { Repository } from 'typeorm';

@Injectable()
export class TeachersService {
  constructor(
    @InjectRepository(TeacherEntity)
    private repository: Repository<TeacherEntity>,
  ) {}

  findAll() {
    return this.repository.find({
      relations: {
        category: true,
      },
    });
  }


  create(dto: CreateTeacherDto) {
    const newTeacher = this.repository.create({
      firstName: dto.firstName,
      middleName: dto.middleName,
      lastName: dto.lastName,
      category: { id: dto.category },
    });

    return this.repository.save(newTeacher);
  }

  async update(id: number, dto: UpdateTeacherDto) {
    const teacher = await this.repository.findOne({
      where: { id },
      relations: { category: true },
    });

    if (!teacher) {
      throw new NotFoundException();
    }

    const { category, ...rest } = dto;

    return this.repository.save({
      ...teacher,
      ...rest,
      category: { id: category },
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
