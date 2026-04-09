import { Column, Entity, ManyToOne, JoinColumn, PrimaryGeneratedColumn } from 'typeorm'

import { PlanEntity } from 'src/modules/plans/plans/entities/plan.entity'
import { TeacherCategoryEntity } from 'src/modules/core/teacher-categories/entities/teacher-category.entity'

@Entity('plan-subjects')
export class PlanSubjectEntity {
  @PrimaryGeneratedColumn()
  id: number

  @ManyToOne(() => PlanEntity, (plan) => plan.subjects, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'plan' })
  plan: PlanEntity

  @ManyToOne(() => TeacherCategoryEntity)
  @JoinColumn({ name: 'cmk' })
  cmk: TeacherCategoryEntity

  @Column()
  name: string

  @Column({ default: false })
  isElective: boolean

  @Column({ type: 'text', nullable: true })
  electiveDescription?: string | null

  // Optional: can be used to store a dedicated Google Drive folder id for this subject
  @Column({ type: 'text', nullable: true })
  electiveDriveFolderId?: string | null

  @Column({ default: 0 })
  totalHours: number

  @Column({ default: null })
  semesterNumber: number | null

  @Column({ default: 0 })
  lectures?: number

  @Column({ default: 0 })
  practical?: number

  @Column({ default: 0 })
  laboratory?: number

  @Column({ default: 0 })
  seminars?: number

  @Column({ default: 0 })
  exams?: number

  @Column({ default: 0 })
  examsConsulation?: number

  @Column({ default: 0 })
  metodologicalGuidance?: number

  @Column({ default: 0 })
  independentWork?: number
}
