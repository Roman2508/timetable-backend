import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { PlanCategoryEntity } from 'src/plan-categories/entities/plan-category.entity';
import { PlanSubjectEntity } from 'src/plan-subjects/entities/plan-subject.entity';

@Entity('plans')
export class PlanEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => PlanCategoryEntity, (planCategory) => planCategory.plans)
  category: PlanCategoryEntity;

  @Column()
  name: string;

  @OneToMany(() => PlanSubjectEntity, planSubjects => planSubjects.plan)
  subjects: PlanSubjectEntity[];
}
