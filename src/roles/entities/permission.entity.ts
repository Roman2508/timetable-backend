import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm'

import { RoleEntity } from './role.entity'

@Entity('permission')
export class PermissionEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  page: string

  @Column()
  action: string

  @ManyToOne(() => RoleEntity, (role) => role.permissions)
  roles: RoleEntity
}
