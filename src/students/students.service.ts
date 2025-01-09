import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

import { UsersService } from 'src/users/users.service';
import { StudentEntity } from './entities/student.entity';
import { UserRoles } from 'src/users/entities/user.entity';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { GroupEntity } from 'src/groups/entities/group.entity';

@Injectable()
export class StudentsService {
  constructor(
    private usersService: UsersService,

    @InjectRepository(GroupEntity)
    private groupRepository: Repository<GroupEntity>,

    @InjectRepository(StudentEntity)
    private repository: Repository<StudentEntity>,
  ) {}

  async create(dto: CreateStudentDto) {
    // Можна передавати ID групи або ім'я циклової та групу в такому форматі: CategoryName/GroupName
    if (typeof dto.group === 'number') {
      const student = this.repository.create({ ...dto, group: { id: dto.group } });

      await this.usersService.create({
        email: dto.email,
        password: dto.password,
        role: UserRoles.STUDENT,
        roleId: student.id,
      });

      return this.repository.save(student);
    }

    const groupData = dto.group.split('/');
    const categoryName = groupData[0];
    const groupName = groupData[1];

    const group = await this.groupRepository.findOne({ where: { name: groupName, category: { name: categoryName } } });

    if (!group) throw new BadRequestException('Не вірно вказано групу');

    const doc = this.repository.create({ ...dto, group: { id: group.id } });

    const student = await this.repository.save(doc);

    await this.usersService.create({
      email: dto.email,
      password: dto.password,
      role: UserRoles.STUDENT,
      roleId: student.id,
    });

    return student;
  }

  async findAllByGroupId(id: number) {
    return this.repository.find({
      where: { group: { id } },
      relations: { group: true },
      select: { group: { id: true, name: true } },
    });
  }

  async update(id: number, dto: UpdateStudentDto) {
    const student = await this.repository.findOne({ where: { id } });

    if (!student) throw new NotFoundException('Студента не знайдено');

    if (typeof dto.group === 'string') throw new BadRequestException('Не вірно вказано групу');

    await this.usersService.update({
      id: student.id,
      email: dto.email,
      password: dto.password,
      role: [UserRoles.STUDENT],
    });

    return this.repository.save({ ...student, ...dto, group: { id: Number(dto.group) } });
  }

  async remove(id: number) {
    const res = await this.repository.delete(id);

    await this.usersService.delete({ id, role: UserRoles.STUDENT });

    if (res.affected === 0) {
      throw new NotFoundException('Не знайдено');
    }

    return id;
  }
}
