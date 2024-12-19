import {
  Column,
  Entity,
  OneToMany,
  JoinColumn,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { IsNotEmpty } from 'class-validator';

import { GroupEntity } from 'src/groups/entities/group.entity';
import { GroupLoadLessonEntity } from 'src/group-load-lessons/entities/group-load-lesson.entity';

@Entity('streams')
export class StreamEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @IsNotEmpty()
  name: string;

  @ManyToMany(() => GroupEntity, (group) => group.stream)
  @JoinColumn({ name: 'groups' })
  groups: GroupEntity[];

  @OneToMany(() => GroupLoadLessonEntity, (lesson) => lesson.stream)
  @JoinColumn({ name: 'lessons' })
  lessons: GroupLoadLessonEntity[];
}
