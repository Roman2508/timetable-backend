import { TeacherEntity } from 'src/teachers/entities/teacher.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity('teacher-category')
export class TeacherCategoryEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ default: '' })
  shortName: string;

  @OneToMany(() => TeacherEntity, (teacher) => teacher.category)
  teachers: TeacherEntity[];
}
