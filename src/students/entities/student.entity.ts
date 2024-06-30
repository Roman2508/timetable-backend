import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { GroupEntity } from 'src/groups/entities/group.entity';
import { GroupLoadLessonEntity } from 'src/group-load-lessons/entities/group-load-lesson.entity';

export enum StudentStatus {
  STUDYING = 'Навчається',
  EXPELLED = 'Відраховано',
  ACADEMIC_LEAVE = 'Академічна відпустка',
}

@Entity('students')
export class StudentEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  login: string;

  @Column()
  password: string;

  @Column()
  email: string;

  @Column({
    type: 'enum',
    enum: StudentStatus,
    default: StudentStatus.STUDYING,
  })
  status: StudentStatus;

  @ManyToOne(() => GroupEntity, (group) => group.students)
  group: GroupEntity;

  @ManyToMany(() => GroupLoadLessonEntity, (lesson) => lesson.students)
  lessons: GroupLoadLessonEntity[];
}
