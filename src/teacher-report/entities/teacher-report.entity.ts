import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { TeacherEntity } from 'src/teachers/entities/teacher.entity';
import { IndividualTeacherWorkEntity } from 'src/individual-teacher-work/entities/individual-teacher-work.entity';

@Entity('teacher-report')
export class TeacherReportEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => TeacherEntity, (teacher) => teacher.id)
  @JoinColumn({ name: 'teacher' })
  teacher: TeacherEntity;

  @ManyToOne(() => IndividualTeacherWorkEntity, (work) => work.id)
  @JoinColumn({ name: 'individualWork' })
  individualWork: IndividualTeacherWorkEntity;

  @Column()
  hours: number;

  @Column({ default: false })
  status: boolean;

  @Column()
  plannedDate: string;

  @Column()
  doneDate: string;

  @Column({ default: '' })
  description: string;

  @Column('text', { array: true, default: [] })
  files: string[];
}
