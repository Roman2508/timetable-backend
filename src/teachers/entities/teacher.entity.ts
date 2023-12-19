import { GroupLoadLessonEntity } from 'src/group-load-lessons/entities/group-load-lesson.entity';
import { TeacherCategoryEntity } from 'src/teacher-categories/entities/teacher-category.entity';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('teacher')
export class TeacherEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => TeacherCategoryEntity, (category) => category.teachers)
  category: TeacherCategoryEntity;

  @OneToMany(
    () => GroupLoadLessonEntity,
    (groupLoadLessons) => groupLoadLessons.teacher,
  )
  lessons: GroupLoadLessonEntity[];

  @Column()
  firstName: string;

  @Column()
  middleName: string;

  @Column()
  lastName: string;
}
