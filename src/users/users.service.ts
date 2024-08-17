import { ILike, Repository } from 'typeorm';
import { compare, genSalt, hash } from 'bcryptjs';
import { InjectRepository } from '@nestjs/typeorm';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

import { CreateUserDto } from './dto/create-user.dto';
import { DeleteUserDto } from './dto/delete-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { UserEntity, UserRoles } from './entities/user.entity';
import { GoogleAdminService } from 'src/google-admin/google-admin.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private repository: Repository<UserEntity>,

    private readonly googleAdminService: GoogleAdminService,
  ) {}

  get(dto: { role: UserRoles; email: string; name: string }) {
    // dto = { role, email, name }
    // const isTeacher = dto.role.some((el) => el === UserRoles.TEACHER);
    // const isStudent = dto.role.some((el) => el === UserRoles.STUDENT);

    return this.repository.find({
      where: {
        role: dto.role,
        email: dto.email,
        // role: ILike(`%${name}%`), // Case-insensitive search
      },
    });
  }

  findByEmail(email: string) {
    return this.repository.findOne({ where: { email }, relations: { teacher: true, student: true } });
  }

  findById(id: number) {
    return this.repository.findOne({ where: { id }, relations: { teacher: true, student: true } });
  }

  async create(dto: CreateUserDto) {
    const salt = await genSalt(10);

    if (!dto.roleId && (dto.role === UserRoles.TEACHER || dto.role === UserRoles.STUDENT)) {
      throw new BadRequestException('Role ID is required for roles teacher and student');
    }

    let userPayload: Omit<UserEntity, 'id'> = {
      password: await hash(dto.password, salt),
      email: dto.email,
      role: [dto.role],
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

  async update(dto: UpdateUserDto) {
    // if teacher: id === teacherId, if student: id === studentId, else id === this entity id

    const isTeacher = dto.role.some((el) => el === UserRoles.TEACHER);
    const isStudent = dto.role.some((el) => el === UserRoles.STUDENT);

    let user;

    if (isTeacher || isStudent) {
      const roleKey = isTeacher ? 'teacher' : 'student';

      user = await this.repository.findOne({
        where: { [roleKey]: { id: dto.id } },
        relations: { student: true, teacher: true },
      });
    } else {
      user = await this.repository.findOne({ where: { id: dto.id } });
    }

    if (!user) throw new NotFoundException('Не знайдено');

    const isPasswordsTheSame = await compare(dto.password, user.password);

    let updatedUser = { ...user, email: dto.email };

    if (!isPasswordsTheSame) {
      const salt = await genSalt(10);
      const newPassword = await hash(dto.password, salt);
      updatedUser = { ...updatedUser, password: newPassword };
    }

    return this.repository.save(updatedUser);
  }

  async updateRole(dto: UpdateUserRoleDto) {
    const user = await this.repository.findOne({ where: { id: dto.id } });
    if (!user) throw new NotFoundException('Не знайдено');
    return this.repository.save({ ...user, role: [...user.role, dto.newRole] });
  }

  async updatePicture() {}

  async delete(dto: DeleteUserDto) {
    if (dto.role === UserRoles.TEACHER || dto.role === UserRoles.STUDENT) {
      const roleKey = dto.role.toLowerCase();

      const user = await this.repository.findOne({ where: { role: dto.role, [roleKey]: { id: dto.id } } });
      if (!user) throw new NotFoundException('Не знайдено');
      const res = await this.repository.delete(user.id);

      if (res.affected === 0) {
        throw new NotFoundException('Не знайдено');
      }
      return user.id;
    }

    if (dto.role === UserRoles.ADMIN || dto.role === UserRoles.HEAD_OF_DEPARTMENT || dto.role === UserRoles.GUEST) {
      const res = await this.repository.delete(dto.id);

      if (res.affected === 0) {
        throw new NotFoundException('Не знайдено');
      }

      return dto.id;
    }
  }
}
