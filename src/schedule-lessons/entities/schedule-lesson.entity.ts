import {
  Column,
  Entity,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { IsNotEmpty } from 'class-validator';

import { GroupEntity } from 'src/groups/entities/group.entity';
import { StreamEntity } from 'src/streams/entities/stream.entity';
import { TeacherEntity } from 'src/teachers/entities/teacher.entity';
import { AuditoryEntity } from 'src/auditories/entities/auditory.entity';

@Entity('schedule-lessons')
export class ScheduleLessonsEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @IsNotEmpty()
  name: string;

  @Column()
  @IsNotEmpty()
  date: Date;

  @Column()
  @IsNotEmpty()
  lessonNumber: number;

  @Column()
  @IsNotEmpty()
  semester: number;

  @Column()
  @IsNotEmpty()
  students: number;

  @Column()
  @IsNotEmpty()
  totalHours: number;

  @Column()
  @IsNotEmpty()
  typeRu: 'ЛК' | 'ПЗ' | 'ЛАБ' | 'СЕМ' | 'ЕКЗ';

  @Column({ default: null })
  subgroupNumber: number;

  @ManyToOne(() => TeacherEntity, (teacher) => teacher.id)
  @JoinColumn({ name: 'replacement' })
  replacement: TeacherEntity;

  @Column({ default: null })
  note: string;

  @ManyToOne(() => GroupEntity, (group) => group.id)
  @JoinColumn({ name: 'group' })
  group: GroupEntity;

  @ManyToOne(() => TeacherEntity, (teacher) => teacher.id)
  @JoinColumn({ name: 'teacher' })
  teacher: TeacherEntity;

  @ManyToOne(() => AuditoryEntity, (auditory) => auditory.id)
  @JoinColumn({ name: 'auditory' })
  auditory: AuditoryEntity;

  @ManyToOne(() => StreamEntity, (stream) => stream.id)
  @JoinColumn({ name: 'stream' })
  stream: StreamEntity;
}
