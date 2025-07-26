import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable } from 'typeorm';

import { PermissionEntity } from './permission.entity';
import { UserEntity } from 'src/users/entities/user.entity';

@Entity()
export class RoleEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ unique: true })
  key: string;

  @ManyToMany(() => PermissionEntity, (permission) => permission.roles, { cascade: true })
  @JoinTable()
  permissions: PermissionEntity[];

  @ManyToMany(() => UserEntity, (user) => user.roles)
  users: UserEntity[];
}
