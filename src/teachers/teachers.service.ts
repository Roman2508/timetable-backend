import { Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'

import { UsersService } from 'src/users/users.service'
import { RolesService } from 'src/roles/roles.service'
import { TeacherEntity } from './entities/teacher.entity'
import { CreateTeacherDto } from './dto/create-teacher.dto'
import { UpdateTeacherDto } from './dto/update-teacher.dto'
import { UserEntity, UserRoles } from 'src/users/entities/user.entity'
import { GoogleDriveService } from 'src/google-drive/google-drive.service'
import { GoogleCalendarService } from 'src/google-calendar/google-calendar.service'

@Injectable()
export class TeachersService {
  constructor(
    private readonly usersService: UsersService,
    private readonly rolesService: RolesService,
    private readonly googleDriveService: GoogleDriveService,
    private readonly googleCalendarService: GoogleCalendarService,

    @InjectRepository(TeacherEntity)
    private repository: Repository<TeacherEntity>,

    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
  ) {}

  findAll() {
    return this.repository.find({ relations: { category: true } })
  }

  findOne(id: number) {
    return this.repository.findOne({
      where: { id },
      relations: { category: true, user: true },
      select: {
        id: true,
        firstName: true,
        middleName: true,
        lastName: true,
        calendarId: true,
        status: true,
        isHide: true,
        user: { id: true, email: true, lastLogin: true },
        category: { id: true, name: true },
      },
    })
  }

  async create(dto: CreateTeacherDto) {
    const owner = `${dto.lastName} ${dto.firstName[0]}. ${dto.middleName[0]}. `
    // const calendarId = await this.googleCalendarService.createCalendar({ owner })
    const calendarId = 'calendarId'

    const name = `${dto.lastName} ${dto.firstName} ${dto.middleName}`
    // const folderId = await this.googleDriveService.createFolder({ name });
    const folderId = 'folderId'

    const doc = this.repository.create({
      folderId,
      calendarId,
      status: dto.status,
      lastName: dto.lastName,
      firstName: dto.firstName,
      middleName: dto.middleName,
      category: { id: dto.category },
    })

    const newTeacher = await this.repository.save(doc)

    const teacherRole = await this.rolesService.getByKey('teacher')

    if (!teacherRole) throw new BadRequestException('Не вдалось визначити роль для викладача')

    const user = await this.usersService.create({
      name,
      email: dto.email,
      password: dto.password,
      role: teacherRole,
      roleId: newTeacher.id,
    })

    if (user.id) {
      await this.repository.save({ id: newTeacher.id, user: { id: user.id } })
      return this.findOne(newTeacher.id)
    } else {
      await this.repository.delete(newTeacher.id)
      throw new BadRequestException('Не вдалось створити викладача')
    }
  }

  async update(id: number, dto: UpdateTeacherDto) {
    const teacher = await this.repository.findOne({ where: { id }, relations: { category: true, user: true } })

    if (!teacher) {
      throw new NotFoundException('Викладач не знайдений')
    }

    const user = await this.usersService.findByEmail(dto.email)

    const name = `${dto.lastName} ${dto.firstName} ${dto.middleName}`

    const userDto = {
      name,
      roles: [UserRoles.TEACHER],
      email: dto.email ? dto.email : user.email,
      password: dto.password ? dto.password : user.password,
    }
    await this.usersService.update(teacher.user.id, userDto)

    const isFirstNameDifferent = teacher.firstName !== dto.firstName
    const isMiddleNameDifferent = teacher.middleName !== dto.middleName
    const isLastNameDifferent = teacher.lastName !== dto.lastName

    // Якщо змінилось ім'я, прізвище або побатькові - переіменовую гугл календар та папку на гугл диску
    if (isFirstNameDifferent || isMiddleNameDifferent || isLastNameDifferent) {
      const owner = `${dto.lastName} ${dto.firstName[0]}. ${dto.middleName[0]}. `
      const name = `${dto.lastName} ${dto.firstName} ${dto.middleName}`
      const { calendarId, folderId } = teacher

      await this.googleCalendarService.updateCalendar({ calendarId, owner })
      await this.googleDriveService.updateFolderName({ name, folderId })
    }

    const { category, ...rest } = dto

    return this.repository.save({
      ...teacher,
      ...rest,
      category: { id: category },
    })
  }

  async updateBio(id: number, bio: any) {
    const teacher = await this.repository.findOne({ where: { id } })
    if (!teacher) {
      throw new NotFoundException()
    }
    return this.repository.save({ ...teacher, bio })
  }

  async updatePrintedWorks(id: number, printedWorks: any) {
    const teacher = await this.repository.findOne({ where: { id } })
    if (!teacher) {
      throw new NotFoundException()
    }
    return this.repository.save({ ...teacher, printedWorks })
  }

  async handleVisible(id: number) {
    const teacher = await this.repository.findOne({
      where: { id },
    })

    if (!teacher) throw new NotFoundException('Групу не знайдено')

    await this.repository.save({ ...teacher, isHide: !teacher.isHide })

    return { id }
  }

  async remove(id: number) {
    // id === teacherId
    const teacher = await this.repository.findOne({ where: { id } })

    if (!teacher) throw new NotFoundException('Викладача не знайдено')

    const user = await this.usersRepository.findOne({ where: { teacher: { id } } })

    if (user) {
      console.log({ role: UserRoles.TEACHER, teacher: { id: teacher.id } })
      await this.usersRepository.delete({ /* role: UserRoles.TEACHER, */ teacher: { id: teacher.id } })
    }

    const res = await this.repository.delete(id)

    if (res.affected === 0) {
      throw new NotFoundException('Не знайдено')
    }

    const folderId = teacher.folderId
    await this.googleDriveService.deleteFolder(folderId)

    return id

    // const teacher = await this.repository.findOne({ where: { id } });

    // if (!teacher) throw new NotFoundException('Не знайдено');

    // await this.usersService.delete({ id, role: UserRoles.TEACHER });

    // const res = await this.repository.delete(id);

    // if (res.affected === 0) {
    //   throw new NotFoundException('Не знайдено');
    // }

    // const folderId = teacher.folderId;
    // await this.googleDriveService.deleteFolder(folderId);

    // return id;
  }
}
