import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { AuditoryCategoryEntity } from 'src/auditory-categories/entities/auditory-category.entity';

export enum AuditoriesStatus {
  ACTIVE = 'Активний',
  ARCHIVE = 'Архів',
}

@Entity('auditories')
export class AuditoryEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ default: 1 })
  seatsNumber: number;

  @Column({ type: 'enum', enum: AuditoriesStatus, default: AuditoriesStatus.ACTIVE })
  status: AuditoriesStatus;

  @ManyToOne(() => AuditoryCategoryEntity, (category) => category.auditories)
  @JoinColumn({ name: 'category' })
  category: AuditoryCategoryEntity;
}
