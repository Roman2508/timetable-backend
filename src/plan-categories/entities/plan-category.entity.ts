import { PlanEntity } from 'src/plans/entities/plan.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity('plan-categories')
export class PlanCategoryEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @OneToMany(() => PlanEntity, (plan) => plan.category)
  plans: PlanEntity[];
}
