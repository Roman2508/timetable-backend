import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PlanCategoryEntity } from 'src/plan-categories/entities/plan-category.entity';
import { PlanSubjectEntity } from 'src/plan-subjects/entities/plan-subject.entity';

@Entity('plans')
export class PlanEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => PlanCategoryEntity, (planCategory) => planCategory.plans)
  @JoinColumn({ name: 'category' })
  category: PlanCategoryEntity;

  @Column()
  name: string;

  @OneToMany(() => PlanSubjectEntity, (planSubjects) => planSubjects.plan)
  @JoinColumn({ name: 'subjects' })
  subjects: PlanSubjectEntity[];
}
