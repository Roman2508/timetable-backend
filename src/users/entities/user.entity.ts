import { Column, Entity, JoinColumn, JoinTable, ManyToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm'

import { RoleEntity } from 'src/roles/entities/role.entity'
import { TeacherEntity } from 'src/modules/core/teachers/entities/teacher.entity'
import { StudentEntity } from 'src/modules/core/students/entities/student.entity'

export enum UserRoles {
  ADMIN = 'ADMIN',
  GUEST = 'GUEST',
  TEACHER = 'TEACHER',
  STUDENT = 'STUDENT',
  HEAD_OF_DEPARTMENT = 'HEAD_OF_DEPARTMENT',
  METHODIST = 'METHODIST',
}

@Entity('user')
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  password: string

  @Column({ default: '' })
  name: string

  @Column({ unique: true })
  email: string

  @ManyToMany(() => RoleEntity, (role) => role.users)
  @JoinTable()
  roles: RoleEntity[]

  @Column({ default: null })
  picture?: string

  @Column({ default: '' })
  lastLogin?: string

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  createdAt?: string

  @OneToOne(() => TeacherEntity, (teacher) => teacher.id, { cascade: true, nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'teacher' })
  teacher?: TeacherEntity

  @OneToOne(() => StudentEntity, (student) => student.id, { cascade: true, nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'student' })
  student?: StudentEntity
}
