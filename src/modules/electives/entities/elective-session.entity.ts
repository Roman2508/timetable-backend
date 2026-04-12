import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm'

export type ElectiveSessionStatus = 'DRAFT' | 'OPEN' | 'CLOSED' | 'FINALIZED'
export type ElectiveSessionDistributionMode = 'BY_GROUP' | 'MIXED'

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

  @Column({ default: 15 })
  minStudentsThreshold: number

  @Column({ type: 'timestamptz' })
  closesAt: Date

  // Example: { "1": 1, "2": 1, "3": 2 }
  @Column({ type: 'jsonb', default: {} })
  maxElectivesPerSemester: Record<string, number>

  @Column({ type: 'text', nullable: true })
  scopeNote?: string | null

  // Snapshot list of allowed groups for this session.
  @Column({ type: 'int', array: true, default: () => 'ARRAY[]::int[]' })
  groupIds: number[]

  // Snapshot list of allowed students
  @Column({ type: 'int', array: true, default: () => 'ARRAY[]::int[]' })
  studentIds: number[]

  // Snapshot list of allowed plan subjects (PlanSubjectEntity.id)
  @Column({ type: 'int', array: true, default: () => 'ARRAY[]::int[]' })
  planSubjectIds: number[]

  @Column({ type: 'varchar', default: 'BY_GROUP' })
  distributionMode: ElectiveSessionDistributionMode

  @Column({ default: 30 })
  maxStudentsPerOffering: number

  @Column({ default: 5 })
  minSharedGroupSize: number

  @Column({ type: 'jsonb', nullable: true })
  resultsSnapshot?: any

  @Column({ type: 'jsonb', nullable: true })
  assignments?: any
}

