import { Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'

import { RoleEntity } from './entities/role.entity'
import { CreateRoleDto } from './dto/create-role.dto'
import { UpdateRoleDto } from './dto/update-role.dto'
import { PermissionEntity } from './entities/permission.entity'
import { CreatePermissionDto } from './dto/create-permission.dto'

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(RoleEntity)
    private roleRepository: Repository<RoleEntity>,

    @InjectRepository(PermissionEntity)
    private permissionRepository: Repository<PermissionEntity>,
  ) {}

  async getAll() {
    const roles = await this.roleRepository.find({ select: { users: true } })
    const rolesList = roles.map((el) => ({ ...el, users: el.users ? el.users.length : 0 }))
    return rolesList
  }

  getFull(id: number) {
    return this.roleRepository.findOne({
      where: { id },
      relations: { permissions: true },
      select: {
        id: true,
        name: true,
        key: true,
        permissions: { id: true, page: true, action: true },
      },
    })
  }

  getByKey(key: string) {
    return this.roleRepository.findOne({
      where: { key },
      relations: { permissions: true },
      select: { id: true, name: true, key: true },
    })
  }

  async createRole(dto: CreateRoleDto) {
    const oldRoleWithSameKey = await this.roleRepository.findOne({ where: { key: dto.key } })

    if (oldRoleWithSameKey) {
      throw new BadRequestException('Роль з таким ключем вже існує')
    }

    const oldRoleWithSameName = await this.roleRepository.findOne({ where: { name: dto.name } })

    if (oldRoleWithSameName) {
      throw new BadRequestException("Роль з таким ім'ям вже існує")
    }

    const newRole = this.roleRepository.create(dto)
    return this.roleRepository.save(newRole)
  }

  async updateRole(id: number, dto: UpdateRoleDto) {
    const role = await this.roleRepository.findOne({ where: { id } })
    if (!role) {
      throw new NotFoundException('Role not found')
    }

    return this.roleRepository.save({ ...role, ...dto })
  }

  async deleteRole(id: number) {
    const res = await this.roleRepository.delete(id)

    if (res.affected === 0) {
      throw new NotFoundException('Не знайдено')
    }

    return id
  }

  /* permissions */

  async createPermission(dto: CreatePermissionDto) {
    const newPermission = this.permissionRepository.create({ ...dto, roles: [{ id: dto.roleId }] })
    return this.permissionRepository.save(newPermission)
  }

  //   async updatePermission(id: number, dto: UpdatPermissionDto) {
  //     const permission = await this.permissionRepository.findOne({ where: { id } });
  //     if (!permission) {
  //       throw new NotFoundException('Permission not found');
  //     }

  //     return this.permissionRepository.save({ ...permission, ...dto });
  //   }

  async deletePermission(id: number) {
    const res = await this.permissionRepository.delete(id)

    if (res.affected === 0) {
      throw new NotFoundException('Не знайдено')
    }

    return id
  }
}
