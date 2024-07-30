import { Injectable } from '@nestjs/common';
import { CreateTeacherReportDto } from './dto/create-teacher-report.dto';
import { UpdateTeacherReportDto } from './dto/update-teacher-report.dto';

@Injectable()
export class TeacherReportService {
  create(createTeacherReportDto: CreateTeacherReportDto) {
    return 'This action adds a new teacherReport';
  }

  findAll() {
    return `This action returns all teacherReport`;
  }

  findOne(id: number) {
    return `This action returns a #${id} teacherReport`;
  }

  update(id: number, updateTeacherReportDto: UpdateTeacherReportDto) {
    return `This action updates a #${id} teacherReport`;
  }

  remove(id: number) {
    return `This action removes a #${id} teacherReport`;
  }
}
