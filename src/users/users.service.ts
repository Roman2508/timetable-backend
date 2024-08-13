import { Repository } from 'typeorm';
import { genSalt, hash } from 'bcryptjs';
import { InjectRepository } from '@nestjs/typeorm';
import { BadRequestException, Injectable } from '@nestjs/common';

import { CreateUserDto } from './dto/create-user.dto';
import { UserEntity, UserRoles } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private repository: Repository<UserEntity>,
  ) {}

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
      login: dto.login,
      role: [dto.role],
    };

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
}
