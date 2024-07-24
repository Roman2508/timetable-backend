import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { GroupLoadLessonEntity } from 'src/group-load-lessons/entities/group-load-lesson.entity';

@Entity('instructional-material')
export class InstructionalMaterialEnity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => GroupLoadLessonEntity, (lesson) => lesson.id)
  lesson: GroupLoadLessonEntity;

  @Column()
  name: string;

  @Column()
  lessonNumber: number;
}
