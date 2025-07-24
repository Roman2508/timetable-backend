import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

import { StudentEntity } from 'src/students/entities/student.entity';
import { TeacherEntity } from 'src/teachers/entities/teacher.entity';

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
  id: number;

  @Column()
  password: string;

  @Column({ default: '' })
  name: string;

  @Column({ unique: true })
  email: string;

  @Column('simple-json', { default: [] })
  role: UserRoles[];

  // @ManyToMany(() => Role)
  // @JoinTable()
  // roles: Role[];

  @Column({ default: null })
  picture?: string;

  @Column({ default: '' })
  lastLogin?: string;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  createdAt?: string;

  @OneToOne(() => TeacherEntity, (teacher) => teacher.id, { cascade: true, nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'teacher' })
  teacher?: TeacherEntity;

  @OneToOne(() => StudentEntity, (student) => student.id, { cascade: true, nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'student' })
  student?: StudentEntity;
}
