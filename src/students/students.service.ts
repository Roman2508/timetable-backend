import { Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'

import { UsersService } from 'src/users/users.service'
import { RolesService } from 'src/roles/roles.service'
import { StudentEntity } from './entities/student.entity'
import { CreateStudentDto } from './dto/create-student.dto'
import { UpdateStudentDto } from './dto/update-student.dto'
import { UserEntity } from 'src/users/entities/user.entity'
import { GroupEntity } from 'src/groups/entities/group.entity'

@Injectable()
export class StudentsService {
  constructor(
    private usersService: UsersService,
    private rolesService: RolesService,

    @InjectRepository(GroupEntity)
    private groupRepository: Repository<GroupEntity>,

    @InjectRepository(StudentEntity)
    private repository: Repository<StudentEntity>,

    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
  ) {}

  async create(dto: CreateStudentDto) {
    let existedStudent = await this.findByEmail(dto.email)
    if (existedStudent) {
      throw new BadRequestException('Студент з таким email вже існує')
    }

    existedStudent = await this.findByLogin(dto.login)
    if (existedStudent) {
      throw new BadRequestException('Студент з таким login вже існує')
    }

    const studentRole = await this.rolesService.getByKey('student')

    // Можна передавати ID групи або ім'я циклової та групу в такому форматі: CategoryName/GroupName
    if (typeof dto.group === 'number') {
      const doc = this.repository.create({ ...dto, group: { id: dto.group } })

      const student = await this.repository.save(doc)

      await this.usersService.create({
        name: dto.name,
        email: dto.email,
        password: dto.password,
        role: studentRole,
        roleId: student.id,
      })

      return student
    }

    const groupData = dto.group.split('/')
    const categoryName = groupData[0]
    const groupName = groupData[1]

    const group = await this.groupRepository.findOne({ where: { name: groupName, category: { name: categoryName } } })

    if (!group) throw new BadRequestException('Не вірно вказано групу')

    const doc = this.repository.create({ ...dto, group: { id: group.id } })

    const student = await this.repository.save(doc)

    const user = await this.usersService.create({
      name: dto.name,
      email: dto.email,
      password: dto.password,
      role: studentRole,
      roleId: student.id,
    })

    if (!user.id) {
      await this.remove(student.id)
      throw new BadRequestException('Не вдалося створити користувача')
    }

    return student
  }

  async getById(id: number) {
    return this.repository.findOne({
      where: { id },
      relations: { group: true },
      select: { group: { id: true, name: true } },
    })
  }

  async findAllByGroupId(id: number) {
    return this.repository.find({
      where: { group: { id } },
      relations: { group: true },
      select: { group: { id: true, name: true } },
    })
  }

  async findByEmail(email: string) {
    const student = await this.repository.findOne({ where: { email } })

    if (student) {
      throw new BadRequestException('Студент з таким email вже існує')
    }

    return student
  }

  async findByLogin(login: string) {
    const student = await this.repository.findOne({ where: { login } })

    if (student) {
      throw new BadRequestException('Студент з таким login вже існує')
    }

    return student
  }

  async update(id: number, dto: UpdateStudentDto) {
    const student = await this.repository.findOne({ where: { id } })

    if (!student) throw new NotFoundException('Студента не знайдено')

    if (typeof dto.group === 'string') throw new BadRequestException('Не вірно вказано групу')

    // await this.usersService.update({
    //   id: student.id,
    //   email: dto.email,
    //   password: dto.password,
    //   role: [UserRoles.STUDENT],
    // });

    return this.repository.save({ ...student, ...dto, group: { id: Number(dto.group) } })
  }

  async remove(id: number) {
    // id === studentId
    const student = await this.repository.findOne({ where: { id } })

    if (!student) throw new NotFoundException('Студента не знайдено')

    const user = await this.usersRepository.findOne({ where: { student: { id } } })

    if (user) {
      await this.usersRepository.delete({ /* role: UserRoles.STUDENT, */ student: { id: student.id } })
    }

    const res = await this.repository.delete(id)

    if (res.affected === 0) {
      throw new NotFoundException('Не знайдено')
    }

    return id
  }
}
