import { StudentEntity } from 'src/students/entities/student.entity';
import { TeacherEntity } from 'src/teachers/entities/teacher.entity';
import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

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

  @Column({ unique: true })
  email: string;

  @Column({ type: 'enum', enum: UserRoles })
  role: UserRoles[];

  @Column({ default: null })
  picture?: string;

  // @Column({ default: null })
  // lastLogin?: string;

  // @Column({ default: null })
  // createdAt?: string;

  @OneToOne(() => TeacherEntity, (teacher) => teacher.id)
  @JoinColumn({ name: 'teacher' })
  teacher?: TeacherEntity;

  @OneToOne(() => StudentEntity, (student) => student.id)
  @JoinColumn({ name: 'student' })
  student?: StudentEntity;
}
