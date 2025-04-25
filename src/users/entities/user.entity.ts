import { StudentEntity } from 'src/students/entities/student.entity';
import { TeacherEntity } from 'src/teachers/entities/teacher.entity';
import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

export enum UserRoles {
  ADMIN = 'ADMIN',
  GUEST = 'GUEST',
  TEACHER = 'TEACHER',
  STUDENT = 'STUDENT',
  HEAD_OF_DEPARTMENT = 'HEAD_OF_DEPARTMENT',
}

@Entity('user')
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  password: string;

  @Column({ unique: true })
  email: string;

  @Column({ type: 'enum', enum: UserRoles, default: null  })
  role: UserRoles[];

  @Column({ default: null })
  picture?: string;

  @OneToOne(() => TeacherEntity, (teacher) => teacher.id)
  @JoinColumn({ name: 'teacher' })
  teacher?: TeacherEntity;

  @OneToOne(() => StudentEntity, (student) => student.id)
  @JoinColumn({ name: 'student' })
  student?: StudentEntity;
}
