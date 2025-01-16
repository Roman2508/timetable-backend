import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';

import { UsersService } from 'src/users/users.service';
import { TeacherEntity } from './entities/teacher.entity';
import { UserRoles } from 'src/users/entities/user.entity';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { GoogleDriveService } from 'src/google-drive/google-drive.service';
import { GoogleCalendarService } from 'src/google-calendar/google-calendar.service';

@Injectable()
export class TeachersService {
  constructor(
    private readonly usersService: UsersService,
    private readonly googleDriveService: GoogleDriveService,
    private readonly googleCalendarService: GoogleCalendarService,

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

  async create(dto: CreateTeacherDto) {
    const owner = `${dto.lastName} ${dto.firstName[0]}. ${dto.middleName[0]}. `;
    const calendarId = await this.googleCalendarService.createCalendar({ owner });

    const name = `${dto.lastName} ${dto.firstName} ${dto.middleName}`;
    const folderId = await this.googleDriveService.createFolder({ name });

    const doc = this.repository.create({
      folderId,
      calendarId,
      lastName: dto.lastName,
      firstName: dto.firstName,
      middleName: dto.middleName,
      category: { id: dto.category },
    });

    const newTeacher = await this.repository.save(doc);

    await this.usersService.create({
      email: dto.email,
      roleId: newTeacher.id,
      password: dto.password,
      role: UserRoles.TEACHER,
    });

    return newTeacher;
  }

  async update(id: number, dto: UpdateTeacherDto) {
    const teacher = await this.repository.findOne({ where: { id }, relations: { category: true } });

    if (!teacher) {
      throw new NotFoundException();
    }

    const user = await this.usersService.findByEmail(dto.email);

    await this.usersService.update({
      id: teacher.id,
      role: [UserRoles.TEACHER],
      email: dto.email ? dto.email : user.email,
      password: dto.password ? dto.password : user.password,
    });

    const isFirstNameDifferent = teacher.firstName !== dto.firstName;
    const isMiddleNameDifferent = teacher.middleName !== dto.middleName;
    const isLastNameDifferent = teacher.lastName !== dto.lastName;

    // Якщо змінилось ім'я, прізвище або побатькові - переіменовую гугл календар та папку на гугл диску
    if (isFirstNameDifferent || isMiddleNameDifferent || isLastNameDifferent) {
      const owner = `${dto.lastName} ${dto.firstName[0]}. ${dto.middleName[0]}. `;
      const name = `${dto.lastName} ${dto.firstName} ${dto.middleName}`;
      const { calendarId, folderId } = teacher;

      await this.googleCalendarService.updateCalendar({ calendarId, owner });
      await this.googleDriveService.updateFolderName({ name, folderId });
    }

    const { category, ...rest } = dto;

    return this.repository.save({
      ...teacher,
      ...rest,
      category: { id: category },
    });
  }

  async updateBio(id: number, bio: any) {
    const teacher = await this.repository.findOne({ where: { id } });
    if (!teacher) {
      throw new NotFoundException();
    }
    return this.repository.save({ ...teacher, bio });
  }

  async updatePrintedWorks(id: number, printedWorks: any) {
    const teacher = await this.repository.findOne({ where: { id } });
    if (!teacher) {
      throw new NotFoundException();
    }
    return this.repository.save({ ...teacher, printedWorks });
  }

  async handleVisible(id: number) {
    const teacher = await this.repository.findOne({
      where: { id },
    });

    if (!teacher) throw new NotFoundException('Групу не знайдено');

    await this.repository.save({ ...teacher, isHide: !teacher.isHide });

    return { id };
  }

  async remove(id: number) {
    const teacher = await this.repository.findOne({ where: { id } });

    if (!teacher) throw new NotFoundException('Не знайдено');

    await this.usersService.delete({ id, role: UserRoles.TEACHER });

    const res = await this.repository.delete(id);

    if (res.affected === 0) {
      throw new NotFoundException('Не знайдено');
    }

    const folderId = teacher.folderId;
    await this.googleDriveService.deleteFolder(folderId);

    return id;
  }
}
