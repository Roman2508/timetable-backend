import { PlanEntity } from 'src/plans/entities/plan.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('plan-subjects')
export class PlanSubjectEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => PlanEntity, (plan) => plan.subjects)
  // @JoinColumn({ name: 'plan' })
  plan: PlanEntity;

  @Column()
  name: string;

  @Column()
  totalHours: number;

  @Column()
  semesterNumber: number;

  @Column()
  lectures?: number;

  @Column()
  practical?: number;

  @Column()
  laboratory?: number;

  @Column()
  seminars?: number;

  @Column()
  exams?: number;

  @Column()
  examsConsulation?: number;

  @Column()
  metodologicalGuidance?: number;

  @Column()
  independentWork?: number;
}
