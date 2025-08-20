import {
  Column,
  Entity,
  JoinTable,
  ManyToOne,
  OneToMany,
  ManyToMany,
  JoinColumn,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { Max, Min } from 'class-validator'
import { PlanEntity } from 'src/plans/entities/plan.entity'
import { StreamEntity } from 'src/streams/entities/stream.entity'
import { StudentEntity } from 'src/students/entities/student.entity'
import { GroupCategoryEntity } from 'src/group-categories/entities/group-category.entity'
import { GroupLoadLessonEntity } from 'src/group-load-lessons/entities/group-load-lesson.entity'

export enum GroupStatus {
  ACTIVE = 'Активний',
  ARCHIVE = 'Архів',
}

@Entity('groups')
export class GroupEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  @Max(20, { message: 'Максимальна довжина поля - 20 символів' })
  name: string

  @ManyToOne(() => GroupCategoryEntity, (category) => category.groups)
  category: GroupCategoryEntity

  @Column({ default: 1 })
  @Min(1, { message: 'Номер курсу може бути від 1 до 3' })
  @Max(3, { message: 'Номер курсу може бути від 1 до 3' })
  courseNumber: number

  @Min(2018, { message: 'Рік вступу не може бути менше ніж 2022' })
  @Max(2100, { message: 'Рік вступу не може бути більше ніж 2100' })
  @Column({ default: Number(Date().split(' ')[3]) }) // Поточний рік
  yearOfAdmission: number

  @OneToMany(() => StudentEntity, (student) => student.group)
  @JoinColumn({ name: 'students' })
  students: StudentEntity[]

  @Column({ default: 'Денна' })
  formOfEducation: 'Денна' | 'Заочна'

  @Column({ default: null })
  calendarId: string

  @Column({ default: false })
  isHide: boolean

  @Column({ type: 'enum', enum: GroupStatus, default: GroupStatus.ACTIVE })
  status: GroupStatus

  @OneToMany(() => GroupLoadLessonEntity, (lessons) => lessons.group)
  groupLoad: GroupLoadLessonEntity[]

  @ManyToOne(() => PlanEntity, (plan) => plan.groups)
  @JoinColumn({ name: 'educationPlan' })
  educationPlan: PlanEntity

  @Column('text', { array: true, default: [] })
  specializationList: string[]

  @ManyToMany(() => StreamEntity, (stream) => stream.groups, { onDelete: 'CASCADE' })
  @JoinTable()
  @JoinColumn({ name: 'stream' })
  stream: StreamEntity[]
}
