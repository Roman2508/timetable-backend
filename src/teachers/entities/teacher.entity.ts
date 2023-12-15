import { TeacherCategoryEntity } from 'src/teacher-categories/entities/teacher-category.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('teacher')
export class TeacherEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => TeacherCategoryEntity, (category) => category.teachers)
  category: TeacherCategoryEntity;

  @Column()
  firstName: string;

  @Column()
  middleName: string;

  @Column()
  lastName: string;
}
