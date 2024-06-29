import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { GroupEntity } from 'src/groups/entities/group.entity';
import { StudentEntity } from 'src/students/entities/student.entity';
import { PlanSubjectEntity } from 'src/plan-subjects/entities/plan-subject.entity';

export enum LessonsTypeRu {
  LECTURES = 'ЛК',
  PRACTICAL = 'ПЗ',
  LABORATORY = 'ЛАБ',
  SEMINARS = 'СЕМ',
  EXAMS = 'ЕКЗ',
}

// @Entity('grade-book')
// export class GradeBookEntity {
//   @PrimaryGeneratedColumn()
//   id: number;

//   @ManyToOne(() => PlanSubjectEntity, (lesson) => lesson.id, { onDelete: 'CASCADE' })
//   lesson: PlanSubjectEntity;

//   @ManyToOne(() => GroupEntity, (group) => group.id, { onDelete: 'CASCADE' })
//   @JoinColumn({ name: 'group' })
//   group: GroupEntity;

//   @Column({
//     type: 'enum',
//     enum: LessonsTypeRu,
//     nullable: false,
//   })
//   typeRu: string;

//   @Column({ nullable: false })
//   year: number;

//   @Column({ nullable: false })
//   semester: number;

//   @Column('simple-json', { default: [] })
//   grades: GradesItem[];

//   @Column('simple-json', { default: [] })
//   summary: [
//     {
//       type: string;
//       afterLesson: 5;
//     },
//   ];
// }

// @Entity('')
// export class GradesItem {
// @PrimaryGeneratedColumn()
// id: number;

// @ManyToOne(() => StudentEntity, (student) => student.id, { onDelete: 'CASCADE' })
// @JoinColumn({ name: 'student' })
// student: StudentEntity;

// @ManyToOne(() => GradeBookEntity, (gradeBook) => gradeBook.grades, { onDelete: 'CASCADE' })
// gradeBook: GradeBookEntity;

// @Column('simple-json', { default: [] })
// grades: GradesItem[];
// }

//

// @Entity('')
// export class GradesItem {
//   @Column({ default: 1 })
//   lessonNumber: number;

//   @Column({ default: false })
//   isAbsence: boolean;

//   @Column({ default: 0 })
//   rating: number;

//   @Column({ default: '' })
//   lessonDate: string;
// }

export class GradesItem {
  @Column({ default: 1 })
  lessonNumber: number;

  @Column({ default: false })
  isAbsence: boolean;

  @Column({ default: 0 })
  rating: number;

  @Column({ default: '' })
  lessonDate: string;
}

@Entity('grade-book')
export class GradeBookEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => PlanSubjectEntity, (lesson) => lesson.id, { onDelete: 'CASCADE' })
  lesson: PlanSubjectEntity;

  @ManyToOne(() => StudentEntity, (student) => student.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'student' })
  student: StudentEntity;

  @ManyToOne(() => GroupEntity, (group) => group.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'group' })
  group: GroupEntity;

  @Column({
    type: 'enum',
    enum: LessonsTypeRu,
    nullable: false,
  })
  typeRu: string;

  @Column({ nullable: false })
  year: number;

  @Column({ nullable: false })
  semester: number;

  @Column('simple-json', { default: [] })
  grades: GradesItem[];
}
