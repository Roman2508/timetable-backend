import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'

import { PlanSubjectEntity } from './plan-subject.entity'

@Entity('plan_subject_attachments')
export class PlanSubjectAttachmentEntity {
  @PrimaryGeneratedColumn()
  id: number

  @ManyToOne(() => PlanSubjectEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'planSubjectId' })
  planSubject: PlanSubjectEntity

  @Column()
  driveFileId: string

  @Column()
  name: string

  @Column()
  mimeType: string

  @CreateDateColumn()
  createdAt: Date
}

