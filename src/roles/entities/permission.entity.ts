import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';

import { RoleEntity } from './role.entity';

@Entity()
export class PermissionEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  page: string;

  @Column()
  action: string;

  @ManyToMany(() => RoleEntity, (role) => role.permissions)
  roles: RoleEntity[];
}
