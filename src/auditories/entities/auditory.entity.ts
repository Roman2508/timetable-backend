import { AuditoryCategoryEntity } from 'src/auditory-categories/entities/auditory-category.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('auditories')
export class AuditoryEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ default: 1 })
  seatsNumber: number;

  @ManyToOne(() => AuditoryCategoryEntity, (category) => category.auditories)
  @JoinColumn({ name: 'category' })
  category: AuditoryCategoryEntity;
}
