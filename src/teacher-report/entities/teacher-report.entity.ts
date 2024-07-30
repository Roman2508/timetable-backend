import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { TeacherEntity } from 'src/teachers/entities/teacher.entity';
import { IndividualTeacherWorkEntity } from 'src/individual-teacher-work/entities/individual-teacher-work.entity';

@Entity('teacher-report')
export class TeacherReportEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => TeacherEntity, (teacher) => teacher.id)
  teacher: TeacherEntity;

  @ManyToOne(() => IndividualTeacherWorkEntity, (work) => work.id)
  individualWork: IndividualTeacherWorkEntity;

  @Column()
  hours: number;

  @Column({ default: false })
  status: boolean;

  @Column()
  plannedDate: string;

  @Column()
  doneDate: string;

  @Column()
  description: string;

  @Column()
  files: string[];
}