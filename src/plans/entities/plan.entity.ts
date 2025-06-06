import { Column, Entity, ManyToOne, OneToMany, JoinColumn, PrimaryGeneratedColumn } from 'typeorm';
import { GroupEntity } from 'src/groups/entities/group.entity';
import { PlanSubjectEntity } from 'src/plan-subjects/entities/plan-subject.entity';
import { PlanCategoryEntity } from 'src/plan-categories/entities/plan-category.entity';

export enum PlansStatus {
  ACTIVE = 'Активний',
  ARCHIVE = 'Архів',
}

@Entity('plans')
export class PlanEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'enum', enum: PlansStatus, default: PlansStatus.ACTIVE })
  status: PlansStatus;

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
