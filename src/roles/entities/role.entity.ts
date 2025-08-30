import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable, OneToMany } from 'typeorm'

import { PermissionEntity } from './permission.entity'
import { UserEntity } from 'src/users/entities/user.entity'

@Entity('roles')
export class RoleEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  name: string

  @Column()
  key: string

  @OneToMany(() => PermissionEntity, (permission) => permission.roles, { cascade: true })
  @JoinTable()
  permissions: PermissionEntity[]

  @ManyToMany(() => UserEntity, (user) => user.roles)
  users: UserEntity[]
}
