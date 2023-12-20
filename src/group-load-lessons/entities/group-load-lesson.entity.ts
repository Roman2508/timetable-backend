import { GroupEntity } from 'src/groups/entities/group.entity';
import { PlanSubjectEntity } from 'src/plan-subjects/entities/plan-subject.entity';
import { PlanEntity } from 'src/plans/entities/plan.entity';
import { TeacherEntity } from 'src/teachers/entities/teacher.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('group-load-lessons')
export class GroupLoadLessonEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToOne(() => GroupEntity, (group) => group.groupLoad, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'group' })
  group: GroupEntity;

  @ManyToOne(() => TeacherEntity, (teacher) => teacher.lessons)
  @JoinColumn({ name: 'teacher' })
  teacher: TeacherEntity;

  @ManyToOne(() => PlanEntity, (plan) => plan.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'plan' })
  plan: PlanEntity;

  @ManyToOne(() => PlanSubjectEntity, (plan) => plan.id, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'planSubjectId' })
  planSubjectId: PlanSubjectEntity;

  @Column()
  semester: number;

  @Column({ default: null })
  specialization: string;

  @Column()
  typeRu: string;

  @Column()
  typeEn: string;

  @Column()
  hours: number;

  @Column({ default: null })
  stream: number;

  @Column({ default: null })
  subgroupNumber: number;

  @Column({ default: 1 })
  students: number;
}
