import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm'

export type ElectiveSessionStatus = 'DRAFT' | 'OPEN' | 'CLOSED' | 'FINALIZED'

@Entity('elective_sessions')
export class ElectiveSessionEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  name: string

  @CreateDateColumn()
  createdAt: Date

  @Column()
  createdByUserId: number

  @Column({ type: 'varchar', default: 'DRAFT' })
  status: ElectiveSessionStatus

  @Column({ default: 10 })
  minStudentsThreshold: number

  @Column({ type: 'timestamptz' })
  closesAt: Date

  // Example: { "1": 1, "2": 1, "3": 2 }
  @Column({ type: 'jsonb', default: {} })
  maxElectivesPerSemester: Record<string, number>

  @Column({ type: 'text', nullable: true })
  scopeNote?: string | null

  // Snapshot list of allowed students
  @Column({ type: 'int', array: true, default: () => 'ARRAY[]::int[]' })
  studentIds: number[]

  // Snapshot list of allowed plan subjects (PlanSubjectEntity.id)
  @Column({ type: 'int', array: true, default: () => 'ARRAY[]::int[]' })
  planSubjectIds: number[]

  @Column({ type: 'jsonb', nullable: true })
  resultsSnapshot?: any

  @Column({ type: 'jsonb', nullable: true })
  assignments?: any
}

