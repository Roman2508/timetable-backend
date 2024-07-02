import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { GroupEntity } from 'src/groups/entities/group.entity';
import { GradesEntity } from 'src/grades/entities/grade.entity';
import { GroupLoadLessonEntity } from 'src/group-load-lessons/entities/group-load-lesson.entity';

export enum LessonsTypeRu {
  LECTURES = 'ЛК',
  PRACTICAL = 'ПЗ',
  LABORATORY = 'ЛАБ',
  SEMINARS = 'СЕМ',
  EXAMS = 'ЕКЗ',
}

export enum GradeBookSummaryTypes {
  MODULE_AVERAGE = 'MODULE_AVERAGE',
  MODULE_SUM = 'MODULE_SUM',
  LESSON_AVERAGE = 'LESSON_AVERAGE',
  LESSON_SUM = 'LESSON_SUM',
  MODULE_TEST = 'MODULE_TEST',
  ADDITIONAL_RATE = 'ADDITIONAL_RATE',
}

@Entity('grade-book')
export class GradeBookEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => GroupLoadLessonEntity, (lesson) => lesson.id, { onDelete: 'CASCADE' })
  lesson: GroupLoadLessonEntity;

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
  semester: number;

  @Column('simple-json', { default: [] })
  grades: GradesEntity[];

  @Column('simple-json', { default: [] })
  summary: SummaryItem[];
}

export class SummaryItem {
  @Column({
    type: 'enum',
    enum: GradeBookSummaryTypes,
    default: GradeBookSummaryTypes.MODULE_AVERAGE,
    nullable: false,
  })
  type: string;

  @Column()
  afterLesson: number;
}
