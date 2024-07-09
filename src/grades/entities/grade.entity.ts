import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { StudentEntity } from 'src/students/entities/student.entity';
import { GradeBookEntity, GradeBookSummaryTypes } from 'src/grade-book/entities/grade-book.entity';

@Entity('grades')
export class GradesEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => StudentEntity, (student) => student.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'student' })
  student: StudentEntity;

  @ManyToOne(() => GradeBookEntity, (gradeBook) => gradeBook.grades, { onDelete: 'CASCADE' })
  gradeBook: GradeBookEntity;

  @Column('simple-json', { default: [] })
  grades: GradesItem[];
}

export class GradesItem {
  @Column()
  lessonNumber: number;

  @Column({ default: false })
  isAbsence: boolean;

  @Column({ default: 0 })
  rating: number;

  @Column({
    type: 'enum',
    enum: GradeBookSummaryTypes,
    default: null,
    nullable: true,
  })
  summaryType: GradeBookSummaryTypes;
}

