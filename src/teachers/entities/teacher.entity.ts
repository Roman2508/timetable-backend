import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { TeacherReportEntity } from 'src/teacher-report/entities/teacher-report.entity';
import { TeacherCategoryEntity } from 'src/teacher-categories/entities/teacher-category.entity';
import { GroupLoadLessonEntity } from 'src/group-load-lessons/entities/group-load-lesson.entity';

@Entity('teacher')
export class TeacherEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => TeacherCategoryEntity, (category) => category.teachers)
  category: TeacherCategoryEntity;

  @OneToMany(() => GroupLoadLessonEntity, (groupLoadLessons) => groupLoadLessons.teacher)
  lessons: GroupLoadLessonEntity[];

  @OneToMany(() => TeacherReportEntity, (report) => report.teacher)
  reports: TeacherReportEntity[];

  @Column()
  firstName: string;

  @Column()
  middleName: string;

  @Column()
  lastName: string;

  // google calendar id
  @Column({ default: null })
  calendarId: string;

  // google drive folder id
  @Column({ default: '' })
  folderId: string;

  @Column({ default: false })
  isHide: boolean;

  @Column({ default: '' })
  position: string;

  @Column('simple-json', { default: [] })
  bio: EditorJSItem[];

  @Column('simple-json', { default: [] })
  printedWorks: EditorJSItem[];
}

export class EditorJSItem {
  @Column({ default: '' })
  id: string;

  @Column({ default: '' })
  type: string;

  @Column('simple-json', { default: [] })
  data: EditorJSItemTextData | EditorJSItemListData;
}

class EditorJSItemTextData {
  @Column({ default: '' })
  text: string;
}

class EditorJSItemListData {
  @Column({ default: '' })
  items: string[];

  @Column({ default: '' })
  style: string;
}
