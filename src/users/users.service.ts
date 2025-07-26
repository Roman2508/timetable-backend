import { ILike, Repository } from 'typeorm';
import { compare, genSalt, hash } from 'bcryptjs';
import { InjectRepository } from '@nestjs/typeorm';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

import { CreateUserDto } from './dto/create-user.dto';
import { DeleteUserDto } from './dto/delete-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { GetAllUsersDto } from './dto/get-all-users.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { UserEntity, UserRoles } from './entities/user.entity';
import { GoogleAdminService } from 'src/google-admin/google-admin.service';
import { RoleEntity } from 'src/roles/entities/role.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private repository: Repository<UserEntity>,

    private readonly googleAdminService: GoogleAdminService,
  ) {}

  getAll(dto: GetAllUsersDto) {
    // query може бути іменем, поштою або ролями, sort це ключ по якому сортувати, order - порядок сортування
    // dto: {query: string, page: number, limit: number, sort: string, order: 'asc' | 'desc'}

    const filter = {} as any;
    const order = {} as any;

    if (dto.query) {
      filter.email = ILike(`%${dto.query}%`);
      filter.role = ILike(`%${dto.query}%`);

      // if(role === UserRoles.TEACHER ) {}
      // if(role === UserRoles.STUDENT) {}
    }

    if (dto.sortBy && (dto.order === 'ASC' || dto.order === 'DESC')) {
      if (dto.sortBy === 'email') {
        order.price = dto.order;
      } else if (dto.sortBy === 'role') {
        order.role = 'DESC';
      } else {
        // order.createdAt = 'DESC';
      }
    } else {
      // order.createdAt = 'DESC';
    }

    return this.repository.findAndCount({
      where: filter,
      take: dto.limit ? dto.limit : 20,
      skip: dto.offset ? dto.offset : 0,
      relations: { student: true, teacher: true },
      select: { id: true, name: true, roles: true, email: true, picture: true, lastLogin: true },
      order,
    });
  }

  // FIX roleId
  get(dto: { role: UserRoles; email: string; name: string }) {
    // dto = { role, email, name }
    // const isTeacher = dto.role.some((el) => el === UserRoles.TEACHER);
    // const isStudent = dto.role.some((el) => el === UserRoles.STUDENT);
    const roleId = 3; // fix
    return this.repository.find({ where: { roles: { id: roleId }, email: dto.email } });
  }

  findByEmail(email: string) {
    return this.repository.findOne({ where: { email }, relations: { teacher: true, student: true } });
  }

  findById(id: number) {
    return this.repository.findOne({ where: { id }, relations: { teacher: true, student: true } });
  }

  findByRoleId(id: number, role: UserRoles) {
    return this.repository.findOne({ where: { [role]: { id } }, relations: { teacher: true, student: true } });
  }

  async create(dto: CreateUserDto) {
    const salt = await genSalt(10);

    // Якщо немає ІД і роль Викладач або Студент = повертаю помилку
    // if (!dto.roleId && (dto.role === UserRoles.TEACHER || dto.role === UserRoles.STUDENT)) {
    //   throw new BadRequestException('Role ID is required for roles teacher and student');
    // }

    const existedUser = await this.findByEmail(dto.email);

    if (existedUser) {
      throw new BadRequestException('Користувач з таким адресом ел.пошти вже існує');
    }

    let userPayload: Omit<UserEntity, 'id'> = {
      password: await hash(dto.password, salt),
      email: dto.email,
      name: dto.name,
      // roles: [{ id: dto.roleId }],

      roles: [{ id: dto.roleId } as RoleEntity],

      // role: [dto.role],
    };

    const picture = await this.googleAdminService.getUserPhotoByEmail(dto.email);

    if (picture) {
      userPayload = { ...userPayload, picture };
    }

    if (dto.role === UserRoles.TEACHER && dto.roleId) {
      // @ts-ignore
      userPayload = { ...userPayload, teacher: { id: dto.roleId } };
    }

    if (dto.role === UserRoles.STUDENT && dto.roleId) {
      // @ts-ignore
      userPayload = { ...userPayload, student: { id: dto.roleId } };
    }

    const newUser = this.repository.create(userPayload);

    await this.repository.save(newUser);

    const user = await this.repository.findOne({
      where: { email: newUser.email },
      relations: { student: true, teacher: true },
    });

    const { password: pass, ...result } = user;

    return result;
  }

  async update(id: number, dto: UpdateUserDto) {
    const existedUser = await this.findById(id);
    if (!existedUser) {
      throw new BadRequestException('Користувача не знайдено');
    }

    let updatedUser: any = { role: dto.role, name: dto.name, id };

    if (dto.email !== existedUser.email) {
      const userWithSameEmail = await this.findByEmail(dto.email);

      if (!userWithSameEmail) {
        updatedUser = { ...updatedUser, email: dto.email };
      } else {
        throw new BadRequestException('Користувач з таким email вже зареєстрований');
      }
    }

    let isPasswordsSame = true;

    if (dto.password) {
      isPasswordsSame = await compare(dto.password, existedUser.password);
    }

    if (!isPasswordsSame) {
      const salt = await genSalt(10);
      const newPassword = await hash(dto.password, salt);
      updatedUser = { ...updatedUser, password: newPassword };
    }
    return this.repository.save(updatedUser);
  }

  async updateLastLoginTime(id: number) {
    const user = await this.findById(id);

    const now = new Date();

    // Форматирование даты
    const year = now.getUTCFullYear();
    const month = String(now.getUTCMonth() + 1).padStart(2, '0'); // Месяцы от 0 до 11
    const day = String(now.getUTCDate()).padStart(2, '0');

    // Форматирование времени
    const hours = String(now.getUTCHours()).padStart(2, '0');
    const minutes = String(now.getUTCMinutes()).padStart(2, '0');
    const seconds = String(now.getUTCSeconds()).padStart(2, '0');
    const milliseconds = String(now.getUTCMilliseconds()).padStart(3, '0');

    // Составляем строку
    const microseconds = milliseconds + '000'; // Добавляем 3 нуля для миллисекунд -> микросекунд
    const currentTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${microseconds}+00`;

    return this.repository.save({ ...user, lastLogin: currentTime });
  }

  // async update(dto: UpdateUserDto) {
  //   // if teacher: id === teacherId, if student: id === studentId, else id === this entity id

  //   const existedUser = await this.findByEmail(dto.email);

  //   if (existedUser && dto.id !== existedUser.id) {
  //     throw new BadRequestException('Користувач з таким адресом ел.пошти вже існує');
  //   }

  //   const isTeacher = dto.role.some((el) => el === UserRoles.TEACHER);
  //   const isStudent = dto.role.some((el) => el === UserRoles.STUDENT);

  //   let user;

  //   if (isTeacher || isStudent) {
  //     const roleKey = isTeacher ? 'teacher' : 'student';

  //     user = await this.repository.findOne({
  //       where: { [roleKey]: { id: dto.id } },
  //       relations: { student: true, teacher: true },
  //     });
  //   } else {
  //     user = await this.repository.findOne({ where: { id: dto.id } });
  //   }

  //   if (!user) throw new NotFoundException('Не знайдено');

  //   const isPasswordsTheSame = await compare(dto.password, user.password);

  //   let updatedUser = { ...user, email: dto.email };

  //   if (!isPasswordsTheSame) {
  //     const salt = await genSalt(10);
  //     const newPassword = await hash(dto.password, salt);
  //     updatedUser = { ...updatedUser, password: newPassword };
  //   }

  //   return this.repository.save(updatedUser);
  // }

  async updateRole(dto: UpdateUserRoleDto) {
    const user = await this.repository.findOne({ where: { id: dto.userId } });
    if (!user) throw new NotFoundException('Не знайдено');
    return this.repository.save({ ...user, roles: [...user.roles, { id: dto.newRoleId }] });
  }

  async updatePicture() {}

  // Цей метод для видалення користувачів з ролями admin, head_of_department, guest
  // Для видалення студентів та викладачів у відповідних сервісах є свої методи
  async delete(dto: DeleteUserDto) {
    const res = await this.repository.delete(dto.id);

    if (res.affected === 0) {
      throw new NotFoundException('Не знайдено');
    }

    return dto.id;

    // if (dto.role === UserRoles.TEACHER || dto.role === UserRoles.STUDENT) {
    //   const roleKey = dto.role.toLowerCase();

    //   console.log(dto);

    //   const user = await this.repository.findOne({ where: { role: dto.role, [roleKey]: { id: dto.id } } });

    //   console.log(user);

    //   if (!user) throw new NotFoundException('Не знайдено');
    //   const res = await this.repository.delete(user.id);

    //   if (res.affected === 0) {
    //     throw new NotFoundException('Не знайдено');
    //   }
    //   return user.id;
    // }

    // if (dto.role === UserRoles.ADMIN || dto.role === UserRoles.HEAD_OF_DEPARTMENT || dto.role === UserRoles.GUEST) {
    //   const res = await this.repository.delete(dto.id);

    //   if (res.affected === 0) {
    //     throw new NotFoundException('Не знайдено');
    //   }

    //   return dto.id;
    // }
  }
}
