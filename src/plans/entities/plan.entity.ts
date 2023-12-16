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
import { GroupEntity } from 'src/groups/entities/group.entity';

@Entity('plans')
export class PlanEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToOne(() => PlanCategoryEntity, (planCategory) => planCategory.plans)
  @JoinColumn({ name: 'category' })
  category: PlanCategoryEntity;

  @OneToMany(() => PlanSubjectEntity, (planSubjects) => planSubjects.plan)
  @JoinColumn({ name: 'subjects' })
  subjects: PlanSubjectEntity[];

  @OneToMany(() => GroupEntity, (group) => group.educationPlan)
  @JoinColumn({ name: 'groups' })
  groups: PlanSubjectEntity[];
}
