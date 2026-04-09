import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm'

import { StudentEntity } from 'src/modules/core/students/entities/student.entity'
import { ElectiveSessionEntity } from './elective-session.entity'

export type ElectiveStudentChoiceStatus = 'SUBMITTED' | 'WITHDRAWN'

@Entity('elective_student_choices')
@Unique('UQ_elective_student_choice_session_student', ['session', 'student'])
export class ElectiveStudentChoiceEntity {
  @PrimaryGeneratedColumn()
  id: number

  @ManyToOne(() => ElectiveSessionEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sessionId' })
  session: ElectiveSessionEntity

  @ManyToOne(() => StudentEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'studentId' })
  student: StudentEntity

  @Column({ type: 'timestamptz', nullable: true })
  submittedAt?: Date | null

  @Column({ type: 'varchar', default: 'SUBMITTED' })
  status: ElectiveStudentChoiceStatus

  // { [semesterNumber]: planSubjectId[] }
  @Column({ type: 'jsonb', default: {} })
  prioritiesBySemester: Record<string, number[]>
}

