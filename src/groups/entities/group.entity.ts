import { Max, Min } from 'class-validator';
import { GroupCategoryEntity } from 'src/group-categories/entities/group-category.entity';
import { GroupLoadLessonEntity } from 'src/group-load-lessons/entities/group-load-lesson.entity';
import { PlanEntity } from 'src/plans/entities/plan.entity';
import { StreamEntity } from 'src/streams/entities/stream.entity';
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('groups')
export class GroupEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Max(20, { message: 'Максимальна довжина поля - 20 символів' })
  name: string;

  @ManyToOne(() => GroupCategoryEntity, (category) => category.groups)
  category: GroupCategoryEntity;

  @Column({ default: 1 })
  @Min(1, { message: 'Номер курсу може бути від 1 до 3' })
  @Max(3, { message: 'Номер курсу може бути від 1 до 3' })
  courseNumber: number;

  @Min(2018, { message: 'Рік вступу не може бути менше ніж 2018' })
  @Max(2100, { message: 'Рік вступу не може бути більше ніж 2100' })
  @Column({ default: Number(Date().split(' ')[3]) }) // Поточний рік
  yearOfAdmission: number;

  @Column({ default: 1 })
  @Min(1, {
    message: "Кількість студентів не може бути 0 або від'ємним значенням",
  })
  @Max(200, {
    message: 'Кількість студентів не може бути більше 200',
  })
  students: number;

  @Column({ default: 'Денна' })
  formOfEducation: 'Денна' | 'Заочна';

  @OneToMany(() => GroupLoadLessonEntity, (lessons) => lessons.group)
  groupLoad: GroupLoadLessonEntity[];

  @ManyToOne(() => PlanEntity, (plan) => plan.groups)
  @JoinColumn({ name: 'educationPlan' })
  educationPlan: PlanEntity;

  @Column('text', { array: true, default: [] })
  specializationList: string[];

  @ManyToMany(() => StreamEntity, (stream) => stream.groups, {
    onDelete: 'CASCADE',
  })
  @JoinTable()
  @JoinColumn({ name: 'stream' })
  stream: StreamEntity[];
}
