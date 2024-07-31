import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';

import { TeacherReportEntity } from './entities/teacher-report.entity';
import { CreateTeacherReportDto } from './dto/create-teacher-report.dto';
import { UpdateTeacherReportDto } from './dto/update-teacher-report.dto';

@Injectable()
export class TeacherReportService {
  constructor(
    @InjectRepository(TeacherReportEntity)
    private repository: Repository<TeacherReportEntity>,
  ) {}

  create(dto: CreateTeacherReportDto) {
    const newTeacherReport = this.repository.create({
      ...dto,
      teacher: { id: dto.teacher },
      individualWork: { id: dto.individualWork },
    });
    return this.repository.save(newTeacherReport);
  }

  findByTeacherId(id: number) {
    return this.repository.find({
      where: { teacher: { id } },
      relations: { teacher: true, individualWork: true },
      select: {
        teacher: { id: true, firstName: true, lastName: true, middleName: true },
      },
    });
  }

  async update(id: number, dto: UpdateTeacherReportDto) {
    const teacherReport = await this.repository.findOne({ where: { id } });
    if (!teacherReport) throw new NotFoundException('Не знайдено');
    return this.repository.save({ ...teacherReport, ...dto });
  }

  async uploadFile(id: number, dto: any) {
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
