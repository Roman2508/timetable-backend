import {
  Column,
  Entity,
  ManyToOne,
  JoinTable,
  JoinColumn,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Max, Min } from 'class-validator';

import { PlanEntity } from 'src/plans/entities/plan.entity';
import { GroupEntity } from 'src/groups/entities/group.entity';
import { StreamEntity } from 'src/streams/entities/stream.entity';
import { TeacherEntity } from 'src/teachers/entities/teacher.entity';
import { StudentEntity } from 'src/students/entities/student.entity';
import { PlanSubjectEntity } from 'src/plan-subjects/entities/plan-subject.entity';
import { TeacherCategoryEntity } from 'src/teacher-categories/entities/teacher-category.entity';

// type TypeRu = 'ЛК' | 'ПЗ' | 'ЛАБ' | 'СЕМ' | 'ЕКЗ' | 'КОНС' | 'МЕТОД';
// type TypeEn =
//   | 'lectures'
//   | 'practical'
//   | 'laboratory'
//   | 'seminars'
//   | 'exams'
//   | 'examsConsulation'
//   | 'metodologicalGuidance';

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

  @ManyToOne(() => TeacherCategoryEntity)
  @JoinColumn({ name: 'cmk' })
  cmk: TeacherCategoryEntity;

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

  @ManyToOne(() => StreamEntity, (stream) => stream.lessons, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'stream' })
  stream: StreamEntity;

  @ManyToMany(() => GroupLoadLessonEntity, (lesson) => lesson.id)
  @JoinTable({
    name: 'lessons_united',
    joinColumn: { name: 'lesson_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'united_lesson_id', referencedColumnName: 'id' },
  })
  unitedWith: GroupLoadLessonEntity[];

  @Column({ default: null })
  @Max(4, { message: 'Максимальна кількість підгруп - 4' })
  @Min(1, { message: 'Мінімальна кількість підгруп - 1' })
  subgroupNumber: number;

  @ManyToMany(() => StudentEntity, (student) => student.lessons)
  @JoinTable({
    name: 'student_lessons',
    joinColumn: { name: 'lesson_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'student_id', referencedColumnName: 'id' },
  })
  students: StudentEntity[];

  // @Column({ default: 1 })
  // students: number;
}
