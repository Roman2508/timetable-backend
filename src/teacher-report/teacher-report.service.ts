import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

import { TeacherEntity } from 'src/teachers/entities/teacher.entity';
import { TeacherReportEntity } from './entities/teacher-report.entity';
import { CreateTeacherReportDto } from './dto/create-teacher-report.dto';
import { UpdateTeacherReportDto } from './dto/update-teacher-report.dto';
import { GoogleDriveService } from 'src/google-drive/google-drive.service';

@Injectable()
export class TeacherReportService {
  constructor(
    @InjectRepository(TeacherReportEntity)
    private repository: Repository<TeacherReportEntity>,

    private readonly googleDriveService: GoogleDriveService,
  ) {}

  create(dto: CreateTeacherReportDto) {
    const newTeacherReport = this.repository.create({
      ...dto,
      // За замовчуванням plannedDate === doneDate
      doneDate: dto.plannedDate,
      teacher: { id: dto.teacher },
      individualWork: { id: dto.individualWork },
    });
    return this.repository.save(newTeacherReport);
  }

  find(year: number, id: number) {
    return this.repository.find({
      where: { year, teacher: { id } },
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

  async uploadFile(id: number, file: any) {
    const report = await this.repository.findOne({
      where: { id },
      relations: { teacher: true },
    });

    if (!report) throw new NotFoundException('Не знайдено');

    const folderId = report.teacher.folderId;
    if (!folderId) throw new NotFoundException('Папку не знайдено');

    const fileData = await this.googleDriveService.createFile(file, folderId);
    if (!fileData) throw new BadRequestException('Помилка завантаження');
    return this.repository.save({ id, files: [...report.files, fileData] });
  }

  async deleteFile(id: number, fileId: string) {
    const report = await this.repository.findOne({ where: { id } });
    if (!report) throw new NotFoundException('Не знайдено');
    const deletedFileId = await this.googleDriveService.deleteFile(fileId);

    const files = report.files.filter((f) => f.id !== deletedFileId);
    return this.repository.save({ id, files });
  }

  async remove(id: number) {
    const res = await this.repository.delete(id);

    if (res.affected === 0) {
      throw new NotFoundException('Не знайдено');
    }

    return id;
  }
}
