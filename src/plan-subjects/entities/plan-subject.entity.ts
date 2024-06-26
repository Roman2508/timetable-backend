import { Column, Entity, ManyToOne, JoinColumn, PrimaryGeneratedColumn } from 'typeorm';

import { PlanEntity } from 'src/plans/entities/plan.entity';
import { TeacherCategoryEntity } from 'src/teacher-categories/entities/teacher-category.entity';

@Entity('plan-subjects')
export class PlanSubjectEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => PlanEntity, (plan) => plan.subjects, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'plan' })
  plan: PlanEntity;

  @ManyToOne(() => TeacherCategoryEntity)
  @JoinColumn({ name: 'cmk' })
  cmk: TeacherCategoryEntity;

  @Column()
  name: string;

  @Column({ default: 0 })
  totalHours: number;

  @Column({ default: null })
  semesterNumber: number | null;

  @Column({ default: 0 })
  lectures?: number;

  @Column({ default: 0 })
  practical?: number;

  @Column({ default: 0 })
  laboratory?: number;

  @Column({ default: 0 })
  seminars?: number;

  @Column({ default: 0 })
  exams?: number;

  @Column({ default: 0 })
  examsConsulation?: number;

  @Column({ default: 0 })
  metodologicalGuidance?: number;

  @Column({ default: 0 })
  independentWork?: number;
}
