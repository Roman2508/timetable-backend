import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { In, Repository } from 'typeorm'

import { CreateElectiveSessionDto } from './dto/create-elective-session.dto'
import {
  ElectiveSessionDistributionMode,
  ElectiveSessionEntity,
} from './entities/elective-session.entity'
import { ElectiveStudentChoiceEntity } from './entities/elective-student-choice.entity'
import { GroupEntity } from '../core/groups/entities/group.entity'
import { StreamEntity } from '../core/streams/entities/stream.entity'
import { StudentEntity } from '../core/students/entities/student.entity'
import { PlanSubjectEntity } from '../plans/plan-subjects/entities/plan-subject.entity'
import { GroupLoadLessonEntity } from '../schedule/group-load-lessons/entities/group-load-lesson.entity'
import { GroupLoadLessonsService } from '../schedule/group-load-lessons/group-load-lessons.service'

type SessionAssignmentSource = 'AUTO' | 'MANUAL'

type SessionAssignments = Record<
  string,
  {
    semesters?: Record<
      string,
      {
        planSubjectIds: number[]
        source: SessionAssignmentSource
      }
    >
  }
>

type StudentContext = {
  studentId: number
  groupId: number
  planId: number
}

type GroupBlock = {
  groupId: number
  studentIds: number[]
}

type OfferingCandidate = {
  blocks: GroupBlock[]
  totalStudents: number
}

type OfferingSnapshot = {
  key: string
  semester: string
  planSubjectId: number
  mode: ElectiveSessionDistributionMode
  subgroupNumber: number | null
  groupIds: number[]
  studentIds: number[]
  groupStudentIds: Record<string, number[]>
  groupStudentCounts: Record<string, number>
  totalStudents: number
}

type SubjectEvaluation = {
  offerings: OfferingSnapshot[]
  failingGroupIds: number[]
  groupCounts: Record<string, number>
  mixedEligibleGroupIds: number[]
}

type SemesterSnapshot = {
  threshold: number
  counts: Record<string, number>
  failing: number[]
  offerings: OfferingSnapshot[]
  subjectStats: Record<
    string,
    {
      totalAssigned: number
      groupCounts: Record<string, number>
      failingGroupIds: number[]
      mixedEligibleGroupIds: number[]
      offeringKeys: string[]
    }
  >
  distributionMode: ElectiveSessionDistributionMode
  maxStudentsPerOffering: number
  minSharedGroupSize: number
}

const MIN_SESSION_THRESHOLD = 15
const DEFAULT_MAX_STUDENTS_PER_OFFERING = 30
const DEFAULT_MIN_SHARED_GROUP_SIZE = 5

@Injectable()
export class ElectivesService {
  constructor(
    @InjectRepository(ElectiveSessionEntity)
    private sessionsRepo: Repository<ElectiveSessionEntity>,

    @InjectRepository(ElectiveStudentChoiceEntity)
    private choicesRepo: Repository<ElectiveStudentChoiceEntity>,

    @InjectRepository(StudentEntity)
    private studentsRepo: Repository<StudentEntity>,

    @InjectRepository(GroupEntity)
    private groupsRepo: Repository<GroupEntity>,

    @InjectRepository(PlanSubjectEntity)
    private planSubjectsRepo: Repository<PlanSubjectEntity>,

    @InjectRepository(GroupLoadLessonEntity)
    private groupLoadLessonsRepo: Repository<GroupLoadLessonEntity>,

    @InjectRepository(StreamEntity)
    private streamsRepo: Repository<StreamEntity>,

    private groupLoadLessonsService: GroupLoadLessonsService,
  ) {}

  private cloneAssignments(assignments: unknown): SessionAssignments {
    if (!assignments || typeof assignments !== 'object') return {}
    return JSON.parse(JSON.stringify(assignments)) as SessionAssignments
  }

  private normalizeIdList(ids: number[] | undefined | null) {
    return Array.from(new Set((ids ?? []).map(Number).filter(Boolean)))
  }

  private getManualStudentIdsFromAssignments(assignments: unknown): Set<number> {
    const res = new Set<number>()
    if (!assignments || typeof assignments !== 'object') return res

    for (const [studentIdStr, entry] of Object.entries(assignments as Record<string, any>)) {
      const studentId = Number(studentIdStr)
      const semesters = entry?.semesters
      if (!studentId || !semesters || typeof semesters !== 'object') continue

      for (const semesterEntry of Object.values(semesters as Record<string, any>)) {
        if (semesterEntry?.source === 'MANUAL') {
          res.add(studentId)
          break
        }
      }
    }

    return res
  }

  private getAssignmentsForStudent(assignments: SessionAssignments, studentId: number) {
    const key = String(studentId)
    if (!assignments[key]) assignments[key] = { semesters: {} }
    if (!assignments[key].semesters) assignments[key].semesters = {}
    return assignments[key]
  }

  private setStudentSemesterAssignment(
    assignments: SessionAssignments,
    studentId: number,
    semesterKey: string,
    planSubjectIds: number[],
    source: SessionAssignmentSource,
  ) {
    const studentAssignments = this.getAssignmentsForStudent(assignments, studentId)

    if (!planSubjectIds.length) {
      delete studentAssignments.semesters?.[semesterKey]

      if (!Object.keys(studentAssignments.semesters ?? {}).length) {
        delete assignments[String(studentId)]
      }

      return
    }

    studentAssignments.semesters![semesterKey] = {
      planSubjectIds: [...planSubjectIds],
      source,
    }
  }

  private async getSessionEntity(id: number) {
    const entity = await this.sessionsRepo.findOne({ where: { id } })
    if (!entity) throw new NotFoundException('Сесію не знайдено')
    return entity
  }

  private async getStudentContexts(studentIds: number[]) {
    const normalizedIds = this.normalizeIdList(studentIds)
    if (!normalizedIds.length) return new Map<number, StudentContext>()

    const students = await this.studentsRepo.find({
      where: { id: In(normalizedIds) },
      relations: { group: { educationPlan: true } as any },
      select: {
        id: true,
        group: {
          id: true,
          educationPlan: { id: true },
        },
      } as any,
    })

    if (students.length !== normalizedIds.length) {
      throw new BadRequestException('У сесії є невалідні студенти')
    }

    const result = new Map<number, StudentContext>()

    for (const student of students) {
      const groupId = student.group?.id
      const planId = student.group?.educationPlan?.id

      if (!groupId || !planId) {
        throw new BadRequestException('Для частини студентів не вказано групу або навчальний план')
      }

      result.set(student.id, {
        studentId: student.id,
        groupId,
        planId,
      })
    }

    return result
  }

  private async getSelectedPlanSubjects(session: ElectiveSessionEntity) {
    return this.planSubjectsRepo.find({
      where: { id: In(session.planSubjectIds ?? []) },
      relations: { cmk: true, plan: true },
    })
  }

  private computeAllowedSubjectsBySemester(planSubjects: PlanSubjectEntity[]) {
    const map = new Map<string, number[]>()

    for (const planSubject of planSubjects) {
      const semester = Number(planSubject.semesterNumber ?? 0)
      if (!semester) continue

      const key = String(semester)
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(planSubject.id)
    }

    for (const [semester, ids] of map.entries()) {
      map.set(semester, ids.sort((a, b) => a - b))
    }

    return map
  }

  private getNForSemester(session: ElectiveSessionEntity, semesterKey: string) {
    const n = session.maxElectivesPerSemester?.[semesterKey]
    return typeof n === "number" && n >= 0 ? n : 0
  }

  private getSessionThreshold(session: ElectiveSessionEntity) {
    return Math.max(MIN_SESSION_THRESHOLD, Number(session.minStudentsThreshold ?? MIN_SESSION_THRESHOLD))
  }

  private getSessionMaxStudentsPerOffering(session: ElectiveSessionEntity) {
    const value = Number(session.maxStudentsPerOffering ?? DEFAULT_MAX_STUDENTS_PER_OFFERING)
    return value >= MIN_SESSION_THRESHOLD ? value : DEFAULT_MAX_STUDENTS_PER_OFFERING
  }

  private getSessionMinSharedGroupSize(session: ElectiveSessionEntity) {
    const value = Number(session.minSharedGroupSize ?? DEFAULT_MIN_SHARED_GROUP_SIZE)
    return value >= 1 ? value : DEFAULT_MIN_SHARED_GROUP_SIZE
  }

  private buildOfferingSnapshot(
    subjectId: number,
    semesterKey: string,
    subgroupNumber: number | null,
    mode: ElectiveSessionDistributionMode,
    cohort: OfferingCandidate,
  ): OfferingSnapshot {
    const groupStudentIds = Object.fromEntries(cohort.blocks.map((block) => [String(block.groupId), [...block.studentIds]]))
    const groupIds = cohort.blocks.map((block) => block.groupId)
    const studentIds = cohort.blocks.flatMap((block) => block.studentIds)

    return {
      key: `${semesterKey}:${subjectId}:${subgroupNumber ?? 'main'}:${groupIds.join('-')}`,
      semester: semesterKey,
      planSubjectId: subjectId,
      mode,
      subgroupNumber,
      groupIds,
      studentIds,
      groupStudentIds,
      groupStudentCounts: Object.fromEntries(Object.entries(groupStudentIds).map(([groupId, ids]) => [groupId, ids.length])),
      totalStudents: studentIds.length,
    }
  }

  private splitIntoBalancedCohorts(studentIds: number[], minStudents: number, maxStudents: number) {
    if (!studentIds.length) return [] as number[][]
    if (studentIds.length < minStudents) return null

    const cohortsCount = Math.ceil(studentIds.length / maxStudents)
    if (studentIds.length / cohortsCount < minStudents) return null

    const sortedStudentIds = [...studentIds].sort((a, b) => a - b)
    const baseSize = Math.floor(sortedStudentIds.length / cohortsCount)
    const remainder = sortedStudentIds.length % cohortsCount

    const cohorts: number[][] = []
    let cursor = 0

    for (let index = 0; index < cohortsCount; index += 1) {
      const size = baseSize + (index < remainder ? 1 : 0)
      const chunk = sortedStudentIds.slice(cursor, cursor + size)

      if (chunk.length < minStudents || chunk.length > maxStudents) {
        return null
      }

      cohorts.push(chunk)
      cursor += size
    }

    return cohorts
  }

  private buildOfferingsForByGroupMode(
    session: ElectiveSessionEntity,
    semesterKey: string,
    subjectId: number,
    groupStudentIdsMap: Map<number, number[]>,
  ): SubjectEvaluation {
    const threshold = this.getSessionThreshold(session)
    const maxStudentsPerOffering = this.getSessionMaxStudentsPerOffering(session)
    const offerings: OfferingSnapshot[] = []
    const failingGroupIds: number[] = []
    const groupCounts = Object.fromEntries(
      [...groupStudentIdsMap.entries()].map(([groupId, studentIds]) => [String(groupId), studentIds.length]),
    )

    let subgroupCursor = 0

    for (const [groupId, studentIds] of [...groupStudentIdsMap.entries()].sort(([a], [b]) => a - b)) {
      const cohorts = this.splitIntoBalancedCohorts(studentIds, threshold, maxStudentsPerOffering)

      if (!cohorts) {
        failingGroupIds.push(groupId)
        continue
      }

      const shouldNumberSubgroups = cohorts.length > 1

      for (const cohort of cohorts) {
        subgroupCursor += 1
        offerings.push(
          this.buildOfferingSnapshot(
            subjectId,
            semesterKey,
            shouldNumberSubgroups ? subgroupCursor : null,
            'BY_GROUP',
            {
              blocks: [{ groupId, studentIds: cohort }],
              totalStudents: cohort.length,
            },
          ),
        )
      }
    }

    return {
      offerings,
      failingGroupIds,
      groupCounts,
      mixedEligibleGroupIds: [],
    }
  }

  private packSmallMixedBlocks(blocks: GroupBlock[], threshold: number, maxStudentsPerOffering: number) {
    const sortedBlocks = [...blocks].sort((a, b) => b.studentIds.length - a.studentIds.length)
    const remainingSizes = sortedBlocks.map((block) => block.studentIds.length)
    const cohorts: OfferingCandidate[] = []

    for (let index = 0; index < sortedBlocks.length; index += 1) {
      const block = sortedBlocks[index]
      const currentSize = block.studentIds.length
      const futureSize = remainingSizes.slice(index + 1).reduce((sum, value) => sum + value, 0)

      const incompleteCohorts = cohorts
        .filter((cohort) => cohort.totalStudents < threshold && cohort.totalStudents + currentSize <= maxStudentsPerOffering)
        .sort((a, b) => b.totalStudents - a.totalStudents)

      if (incompleteCohorts.length) {
        const cohort = incompleteCohorts[0]
        cohort.blocks.push(block)
        cohort.totalStudents += currentSize
        continue
      }

      const fittingValidCohorts = cohorts
        .filter((cohort) => cohort.totalStudents >= threshold && cohort.totalStudents + currentSize <= maxStudentsPerOffering)
        .sort((a, b) => b.totalStudents - a.totalStudents)

      if (fittingValidCohorts.length && currentSize + futureSize < threshold) {
        const cohort = fittingValidCohorts[0]
        cohort.blocks.push(block)
        cohort.totalStudents += currentSize
        continue
      }

      cohorts.push({
        blocks: [block],
        totalStudents: currentSize,
      })
    }

    return cohorts
  }

  private mergeStandaloneCohorts(
    cohorts: OfferingCandidate[],
    maxStudentsPerOffering: number,
  ): { merged: OfferingCandidate[]; untouched: OfferingCandidate[] } {
    const candidates = cohorts
      .filter((cohort) => cohort.blocks.length === 1)
      .sort((a, b) => a.totalStudents - b.totalStudents)
    const untouched = cohorts.filter((cohort) => cohort.blocks.length !== 1)
    const merged: OfferingCandidate[] = []

    let left = 0
    let right = candidates.length - 1

    while (left <= right) {
      if (left === right) {
        merged.push(candidates[left])
        break
      }

      const smallest = candidates[left]
      const biggest = candidates[right]

      if (smallest.totalStudents + biggest.totalStudents <= maxStudentsPerOffering) {
        merged.push({
          blocks: [...biggest.blocks, ...smallest.blocks],
          totalStudents: biggest.totalStudents + smallest.totalStudents,
        })
        left += 1
        right -= 1
        continue
      }

      merged.push(biggest)
      right -= 1
    }

    return { merged, untouched }
  }

  private buildOfferingsForMixedMode(
    session: ElectiveSessionEntity,
    semesterKey: string,
    subjectId: number,
    groupStudentIdsMap: Map<number, number[]>,
  ): SubjectEvaluation {
    const threshold = this.getSessionThreshold(session)
    const maxStudentsPerOffering = this.getSessionMaxStudentsPerOffering(session)
    const minSharedGroupSize = this.getSessionMinSharedGroupSize(session)
    const groupCounts = Object.fromEntries(
      [...groupStudentIdsMap.entries()].map(([groupId, studentIds]) => [String(groupId), studentIds.length]),
    )
    const mixedEligibleGroupIds = [...groupStudentIdsMap.entries()]
      .filter(([, studentIds]) => studentIds.length >= minSharedGroupSize)
      .map(([groupId]) => groupId)
    const failingGroupIds: number[] = []
    const finalCohorts: OfferingCandidate[] = []
    const standaloneCandidates: OfferingCandidate[] = []
    const smallBlocks: GroupBlock[] = []

    for (const [groupId, studentIds] of [...groupStudentIdsMap.entries()].sort(([a], [b]) => a - b)) {
      const size = studentIds.length
      if (!size) continue

      if (size > maxStudentsPerOffering || size < minSharedGroupSize) {
        const standalone = this.splitIntoBalancedCohorts(studentIds, threshold, maxStudentsPerOffering)

        if (!standalone) {
          failingGroupIds.push(groupId)
          continue
        }

        standalone.forEach((cohortStudentIds) => {
          standaloneCandidates.push({
            blocks: [{ groupId, studentIds: cohortStudentIds }],
            totalStudents: cohortStudentIds.length,
          })
        })
        continue
      }

      if (size >= threshold) {
        standaloneCandidates.push({
          blocks: [{ groupId, studentIds: [...studentIds] }],
          totalStudents: size,
        })
        continue
      }

      smallBlocks.push({ groupId, studentIds: [...studentIds] })
    }

    const packedSmallCohorts = this.packSmallMixedBlocks(smallBlocks, threshold, maxStudentsPerOffering)
    const pendingSmallCohorts: OfferingCandidate[] = []

    for (const cohort of packedSmallCohorts) {
      if (cohort.totalStudents >= threshold) {
        finalCohorts.push(cohort)
      } else {
        pendingSmallCohorts.push(cohort)
      }
    }

    for (const pendingCohort of pendingSmallCohorts) {
      const attachableCohort = standaloneCandidates
        .filter((candidate) => candidate.totalStudents + pendingCohort.totalStudents <= maxStudentsPerOffering)
        .sort((a, b) => b.totalStudents - a.totalStudents)[0]

      if (!attachableCohort) {
        failingGroupIds.push(...pendingCohort.blocks.map((block) => block.groupId))
        continue
      }

      attachableCohort.blocks.push(...pendingCohort.blocks)
      attachableCohort.totalStudents += pendingCohort.totalStudents
    }

    const { merged, untouched } = this.mergeStandaloneCohorts(standaloneCandidates, maxStudentsPerOffering)
    finalCohorts.push(...untouched, ...merged)

    const offerings: OfferingSnapshot[] = finalCohorts
      .sort((a, b) => {
        if (a.totalStudents !== b.totalStudents) return b.totalStudents - a.totalStudents
        return (a.blocks[0]?.groupId ?? 0) - (b.blocks[0]?.groupId ?? 0)
      })
      .map((cohort, index, allCohorts) => {
        const subgroupNumber = allCohorts.length > 1 ? index + 1 : null
        const mode = cohort.blocks.length > 1 ? 'MIXED' : 'BY_GROUP'

        return this.buildOfferingSnapshot(subjectId, semesterKey, subgroupNumber, mode, cohort)
      })

    return {
      offerings,
      failingGroupIds: Array.from(new Set(failingGroupIds)).sort((a, b) => a - b),
      groupCounts,
      mixedEligibleGroupIds,
    }
  }

  private buildSubjectEvaluation(
    session: ElectiveSessionEntity,
    semesterKey: string,
    subjectId: number,
    groupStudentIdsMap: Map<number, number[]>,
  ): SubjectEvaluation {
    if (session.distributionMode === 'MIXED') {
      return this.buildOfferingsForMixedMode(session, semesterKey, subjectId, groupStudentIdsMap)
    }

    return this.buildOfferingsForByGroupMode(session, semesterKey, subjectId, groupStudentIdsMap)
  }

  private buildSemesterSnapshot(
    session: ElectiveSessionEntity,
    semesterKey: string,
    allowedSubjectIds: number[],
    assignments: SessionAssignments,
    studentContexts: Map<number, StudentContext>,
  ): SemesterSnapshot {
    const subjectGroupsMap = new Map<number, Map<number, number[]>>()

    for (const [studentIdKey, entry] of Object.entries(assignments)) {
      const studentId = Number(studentIdKey)
      const semesterEntry = entry?.semesters?.[semesterKey]
      const context = studentContexts.get(studentId)

      if (!context || !semesterEntry?.planSubjectIds?.length) continue

      for (const subjectId of semesterEntry.planSubjectIds.filter((id) => allowedSubjectIds.includes(id))) {
        if (!subjectGroupsMap.has(subjectId)) subjectGroupsMap.set(subjectId, new Map())
        const groupStudentIds = subjectGroupsMap.get(subjectId)!
        if (!groupStudentIds.has(context.groupId)) groupStudentIds.set(context.groupId, [])
        groupStudentIds.get(context.groupId)!.push(studentId)
      }
    }

    const counts: Record<string, number> = {}
    const failing: number[] = []
    const offerings: OfferingSnapshot[] = []
    const subjectStats: SemesterSnapshot['subjectStats'] = {}

    for (const subjectId of allowedSubjectIds) {
      const groupStudentIdsMap = subjectGroupsMap.get(subjectId) ?? new Map<number, number[]>()
      const evaluation = this.buildSubjectEvaluation(session, semesterKey, subjectId, groupStudentIdsMap)
      const totalAssigned = [...groupStudentIdsMap.values()].reduce((sum, studentIds) => sum + studentIds.length, 0)

      counts[String(subjectId)] = totalAssigned
      if (evaluation.failingGroupIds.length) failing.push(subjectId)

      subjectStats[String(subjectId)] = {
        totalAssigned,
        groupCounts: evaluation.groupCounts,
        failingGroupIds: evaluation.failingGroupIds,
        mixedEligibleGroupIds: evaluation.mixedEligibleGroupIds,
        offeringKeys: evaluation.offerings.map((offering) => offering.key),
      }

      offerings.push(...evaluation.offerings)
    }

    return {
      threshold: this.getSessionThreshold(session),
      counts,
      failing: Array.from(new Set(failing)).sort((a, b) => a - b),
      offerings,
      subjectStats,
      distributionMode: session.distributionMode,
      maxStudentsPerOffering: this.getSessionMaxStudentsPerOffering(session),
      minSharedGroupSize: this.getSessionMinSharedGroupSize(session),
    }
  }

  private buildResultsSnapshot(
    session: ElectiveSessionEntity,
    assignments: SessionAssignments,
    noSubmission: number[],
    studentContexts: Map<number, StudentContext>,
    allowedBySemester: Map<string, number[]>,
  ) {
    const semesters: Record<string, SemesterSnapshot> = {}
    const unassigned = new Set<number>()

    for (const [semesterKey, allowedSubjectIds] of allowedBySemester.entries()) {
      semesters[semesterKey] = this.buildSemesterSnapshot(session, semesterKey, allowedSubjectIds, assignments, studentContexts)

      const expectedSubjectsCount = this.getNForSemester(session, semesterKey)
      if (expectedSubjectsCount <= 0) continue

      for (const studentId of session.studentIds ?? []) {
        const assignedCount = assignments[String(studentId)]?.semesters?.[semesterKey]?.planSubjectIds?.length ?? 0
        if (assignedCount < expectedSubjectsCount) {
          unassigned.add(studentId)
        }
      }
    }

    return {
      semesters,
      noSubmission,
      unassigned: Array.from(unassigned).sort((a, b) => a - b),
    }
  }

  private async validatePrioritiesBySemester(
    session: ElectiveSessionEntity,
    prioritiesBySemester: Record<string, number[]>,
  ) {
    const planSubjects = await this.planSubjectsRepo.find({
      where: { id: In(session.planSubjectIds) },
      select: { id: true, semesterNumber: true, isElective: true },
    })
    const allowedBySemester = this.computeAllowedSubjectsBySemester(planSubjects)

    for (const [semester, allowedIds] of allowedBySemester.entries()) {
      const ids = prioritiesBySemester?.[semester] ?? []
      const uniq = new Set(ids)

      if (!ids.length) throw new BadRequestException(`Не заповнено пріоритети в семестрі ${semester}`)
      if (uniq.size !== ids.length) throw new BadRequestException(`Дублікати в семестрі ${semester}`)
      if (ids.length !== allowedIds.length) {
        throw new BadRequestException(`У семестрі ${semester} потрібно проставити пріоритет для кожної дисципліни`)
      }

      for (const id of ids) {
        if (!allowedIds.includes(id)) {
          throw new BadRequestException(`У семестрі ${semester} є дисципліни поза allow-list`)
        }
      }
    }

    for (const semester of Object.keys(prioritiesBySemester ?? {})) {
      if (!allowedBySemester.has(semester)) {
        throw new BadRequestException(`Семестр ${semester} не входить до цієї сесії`)
      }
    }
  }

  private async upsertStudentChoice(
    sessionId: number,
    studentId: number,
    prioritiesBySemester: Record<string, number[]>,
  ) {
    const existing = await this.choicesRepo.findOne({
      where: { session: { id: sessionId }, student: { id: studentId } },
      relations: { session: true, student: true },
    })

    const payload = existing
      ? {
          ...existing,
          prioritiesBySemester,
          submittedAt: new Date(),
          status: 'SUBMITTED' as const,
        }
      : this.choicesRepo.create({
          session: { id: sessionId } as any,
          student: { id: studentId } as any,
          prioritiesBySemester,
          submittedAt: new Date(),
          status: 'SUBMITTED',
        })

    return this.choicesRepo.save(payload as any)
  }

  private async buildSessionDetails(session: ElectiveSessionEntity) {
    const students = session.studentIds?.length
      ? await this.studentsRepo.find({
          where: { id: In(session.studentIds ?? []) },
          relations: { group: { category: true } as any },
          select: {
            id: true,
            name: true,
            status: true,
            group: {
              id: true,
              name: true,
              courseNumber: true,
              yearOfAdmission: true,
              formOfEducation: true,
              category: { id: true, name: true },
            },
          } as any,
        })
      : []

    const submittedChoices = session.studentIds?.length
      ? await this.choicesRepo.find({
          where: {
            session: { id: session.id },
            student: { id: In(session.studentIds) },
            status: 'SUBMITTED' as any,
          },
          relations: { student: true },
          select: {
            submittedAt: true,
            student: { id: true },
          } as any,
        })
      : []

    const groups =
      session.groupIds?.length
        ? await this.groupsRepo.find({
            where: { id: In(session.groupIds) },
            relations: { category: true },
            select: {
              id: true,
              name: true,
              courseNumber: true,
              yearOfAdmission: true,
              formOfEducation: true,
              category: { id: true, name: true },
            } as any,
          })
        : []

    const selectedStudentCountByGroupId = new Map<number, number>()
    const submissionByStudentId = new Map<number, { submittedAt?: Date | null }>()

    for (const student of students) {
      if (!student.group?.id) continue
      selectedStudentCountByGroupId.set(student.group.id, (selectedStudentCountByGroupId.get(student.group.id) ?? 0) + 1)
    }

    for (const choice of submittedChoices) {
      if (choice.student?.id) {
        submissionByStudentId.set(choice.student.id, { submittedAt: choice.submittedAt })
      }
    }

    const fallbackGroupsMap = new Map<number, any>()
    for (const student of students) {
      if (!student.group?.id || fallbackGroupsMap.has(student.group.id)) continue

      fallbackGroupsMap.set(student.group.id, {
        id: student.group.id,
        name: student.group.name,
        categoryName: student.group.category?.name ?? null,
        courseNumber: student.group.courseNumber ?? null,
        yearOfAdmission: student.group.yearOfAdmission ?? null,
        formOfEducation: student.group.formOfEducation ?? null,
        studentCount: selectedStudentCountByGroupId.get(student.group.id) ?? 0,
      })
    }

    const groupDetails = (groups.length ? groups : [...fallbackGroupsMap.values()])
      .map((group) => ({
        id: group.id,
        name: group.name,
        categoryName: group.category?.name ?? group.categoryName ?? null,
        courseNumber: group.courseNumber ?? null,
        yearOfAdmission: group.yearOfAdmission ?? null,
        formOfEducation: group.formOfEducation ?? null,
        studentCount: selectedStudentCountByGroupId.get(group.id) ?? group.studentCount ?? 0,
      }))
      .sort((a, b) => a.name.localeCompare(b.name, 'uk'))

    const studentDetails = students
      .map((student) => {
        const submission = submissionByStudentId.get(student.id)

        return {
          id: student.id,
          name: student.name,
          status: student.status,
          group: student.group
            ? {
                id: student.group.id,
                name: student.group.name,
              }
            : null,
          hasSubmitted: Boolean(submission),
          submittedAt: submission?.submittedAt ?? null,
        }
      })
      .sort((a, b) => a.name.localeCompare(b.name, 'uk'))

    const submitted = studentDetails.filter((student) => student.hasSubmitted).length

    return {
      ...session,
      groups: groupDetails,
      students: studentDetails,
      submissionStats: {
        total: studentDetails.length,
        submitted,
        pending: studentDetails.length - submitted,
      },
    }
  }

  async createSession(dto: CreateElectiveSessionDto, createdByUserId: number) {
    const closesAt = new Date(dto.closesAt)
    if (Number.isNaN(closesAt.getTime())) throw new BadRequestException('Невірний closesAt')

    const groupIds = this.normalizeIdList(dto.groupIds)
    const studentIds = this.normalizeIdList(dto.studentIds)
    const planSubjectIds = this.normalizeIdList(dto.planSubjectIds)

    if (!groupIds.length) throw new BadRequestException('Потрібно обрати хоча б одну групу')
    if (!studentIds.length) throw new BadRequestException('Потрібно обрати хоча б одного студента')
    if (!planSubjectIds.length) throw new BadRequestException('Потрібно обрати хоча б одну вибіркову дисципліну')

    const minStudentsThreshold = Number(dto.minStudentsThreshold ?? MIN_SESSION_THRESHOLD)
    if (minStudentsThreshold < MIN_SESSION_THRESHOLD) {
      throw new BadRequestException(`Мінімальна кількість студентів не може бути меншою за ${MIN_SESSION_THRESHOLD}`)
    }

    const maxStudentsPerOffering = Number(dto.maxStudentsPerOffering ?? DEFAULT_MAX_STUDENTS_PER_OFFERING)
    if (maxStudentsPerOffering < minStudentsThreshold) {
      throw new BadRequestException('Максимальна кількість студентів у потоці не може бути меншою за мінімальний поріг')
    }

    const minSharedGroupSize = Number(dto.minSharedGroupSize ?? DEFAULT_MIN_SHARED_GROUP_SIZE)
    if (minSharedGroupSize < 1 || minSharedGroupSize > maxStudentsPerOffering) {
      throw new BadRequestException('Поріг для змішаних груп має бути додатнім і не перевищувати максимальний розмір потоку')
    }

    const distributionMode = dto.distributionMode ?? 'BY_GROUP'

    const groups = await this.groupsRepo.find({
      where: { id: In(groupIds) },
      relations: { educationPlan: true },
      select: {
        id: true,
        educationPlan: { id: true },
      } as any,
    })

    if (groups.length !== groupIds.length) {
      throw new BadRequestException('Список груп містить неіснуючі id')
    }

    const planIds = Array.from(new Set(groups.map((group) => group.educationPlan?.id).filter(Boolean)))
    if (planIds.length !== 1) {
      throw new BadRequestException('Усі групи сесії мають належати до одного навчального плану')
    }

    const planId = Number(planIds[0])

    const planSubjects = await this.planSubjectsRepo.find({
      where: { id: In(planSubjectIds), isElective: true } as any,
      relations: { plan: true },
      select: {
        id: true,
        plan: { id: true },
      } as any,
    })

    if (planSubjects.length !== planSubjectIds.length) {
      throw new BadRequestException('Список вибіркових дисциплін містить невалідні id')
    }

    if (planSubjects.some((subject) => subject.plan?.id !== planId)) {
      throw new BadRequestException('Усі вибіркові дисципліни сесії мають належати до вибраного навчального плану')
    }

    const students = await this.studentsRepo.find({
      where: { id: In(studentIds) },
      relations: { group: { educationPlan: true } as any },
      select: {
        id: true,
        group: {
          id: true,
          educationPlan: { id: true },
        },
      } as any,
    })

    if (students.length !== studentIds.length) {
      throw new BadRequestException('Список студентів містить неіснуючі id')
    }

    const selectedGroupIdsSet = new Set(groupIds)
    for (const student of students) {
      const studentGroupId = student.group?.id
      const studentPlanId = student.group?.educationPlan?.id

      if (!studentGroupId || !selectedGroupIdsSet.has(studentGroupId)) {
        throw new BadRequestException('У списку студентів є студенти поза вибраними групами')
      }

      if (studentPlanId !== planId) {
        throw new BadRequestException('У списку студентів є студенти з іншого навчального плану')
      }
    }

    const session = this.sessionsRepo.create({
      name: dto.name,
      createdByUserId,
      closesAt,
      minStudentsThreshold,
      maxElectivesPerSemester: dto.maxElectivesPerSemester ?? {},
      scopeNote: dto.scopeNote ?? null,
      groupIds,
      studentIds,
      planSubjectIds,
      distributionMode,
      maxStudentsPerOffering,
      minSharedGroupSize,
      status: 'DRAFT',
    })

    return this.sessionsRepo.save(session)
  }

  async getSession(id: number) {
    const session = await this.getSessionEntity(id)
    return this.buildSessionDetails(session)
  }

  async listSessions() {
    return this.sessionsRepo.find({ order: { createdAt: 'DESC' as any } })
  }

  async listActiveSessionsForStudent(studentId: number) {
    const sessions = await this.sessionsRepo.find({
      order: { createdAt: 'DESC' as any },
    })

    const relevantSessions = sessions.filter((session) => (session.studentIds ?? []).includes(studentId))
    if (!relevantSessions.length) return []

    const submittedChoices = await this.choicesRepo.find({
      where: {
        session: { id: In(relevantSessions.map((session) => session.id)) },
        student: { id: studentId },
        status: 'SUBMITTED' as any,
      },
      relations: { session: true },
      select: {
        submittedAt: true,
        status: true,
        session: { id: true },
      } as any,
    })

    const choicesBySessionId = new Map<number, { submittedAt?: Date | null; status?: string }>()
    for (const choice of submittedChoices) {
      if (choice.session?.id) {
        choicesBySessionId.set(choice.session.id, {
          submittedAt: choice.submittedAt,
          status: choice.status,
        })
      }
    }

    return relevantSessions
      .filter((session) => session.status === 'OPEN' || choicesBySessionId.has(session.id))
      .map((session) => {
        const choice = choicesBySessionId.get(session.id)

        return {
          ...session,
          hasSubmitted: Boolean(choice),
          submittedAt: choice?.submittedAt ?? null,
          choiceStatus: choice?.status ?? null,
          isAvailable: session.status === 'OPEN',
        }
      })
  }

  async getOptions(sessionId: number, studentId: number) {
    const session = await this.getSessionEntity(sessionId)
    if (!(session.studentIds ?? []).includes(studentId)) {
      throw new BadRequestException('Вибір недоступний для цього студента')
    }

    const currentChoice = await this.choicesRepo.findOne({
      where: {
        session: { id: sessionId },
        student: { id: studentId },
        status: 'SUBMITTED' as any,
      },
      relations: { session: true, student: true },
      select: {
        id: true,
        submittedAt: true,
        status: true,
        prioritiesBySemester: true,
      } as any,
    })

    if (session.status !== 'OPEN' && !currentChoice) {
      throw new BadRequestException('Сесія недоступна для перегляду')
    }

    const subjects = await this.getSelectedPlanSubjects(session)

    return {
      session,
      subjects,
      currentChoice: currentChoice
        ? {
            id: currentChoice.id,
            submittedAt: currentChoice.submittedAt ?? null,
            status: currentChoice.status,
            prioritiesBySemester: currentChoice.prioritiesBySemester ?? {},
          }
        : null,
    }
  }

  async openSession(id: number) {
    const session = await this.getSessionEntity(id)
    if (!['DRAFT', 'CLOSED'].includes(session.status)) {
      throw new BadRequestException('Можна відкрити тільки DRAFT або CLOSED сесію')
    }

    if (session.status === 'CLOSED') {
      session.assignments = null
      session.resultsSnapshot = null
    }

    session.status = 'OPEN'
    return this.sessionsRepo.save(session)
  }

  async closeSession(id: number) {
    const session = await this.getSessionEntity(id)
    if (session.status !== 'OPEN') throw new BadRequestException('Можна закрити тільки OPEN сесію')
    session.status = 'CLOSED'
    return this.sessionsRepo.save(session)
  }

  async patchChoice(sessionId: number, studentId: number, prioritiesBySemester: Record<string, number[]>) {
    const session = await this.getSessionEntity(sessionId)
    if (session.status !== 'OPEN') throw new BadRequestException('Сесія не відкрита')
    if (!(session.studentIds ?? []).includes(studentId)) {
      throw new BadRequestException('Вибір недоступний для цього студента')
    }

    await this.validatePrioritiesBySemester(session, prioritiesBySemester)

    const student = await this.studentsRepo.findOne({ where: { id: studentId }, select: { id: true } })
    if (!student) throw new BadRequestException('Студента не знайдено')

    return this.upsertStudentChoice(sessionId, studentId, prioritiesBySemester)
  }

  async patchChoiceByAdmin(sessionId: number, studentId: number, prioritiesBySemester: Record<string, number[]>) {
    const session = await this.getSessionEntity(sessionId)
    if (session.status === 'FINALIZED') throw new BadRequestException('Сесія вже фіналізована')
    if (!(session.studentIds ?? []).includes(studentId)) {
      throw new BadRequestException('Вибір недоступний для цього студента')
    }

    await this.validatePrioritiesBySemester(session, prioritiesBySemester)

    const student = await this.studentsRepo.findOne({ where: { id: studentId }, select: { id: true } })
    if (!student) throw new BadRequestException('Студента не знайдено')

    return this.upsertStudentChoice(sessionId, studentId, prioritiesBySemester)
  }

  async clearStudentChoice(sessionId: number, studentId: number) {
    const session = await this.getSessionEntity(sessionId)
    if (session.status === 'FINALIZED') {
      throw new BadRequestException('Не можна очистити вибір у FINALIZED сесії')
    }
    if (!(session.studentIds ?? []).includes(studentId)) {
      throw new BadRequestException('Студент не належить до цієї сесії')
    }

    const existingChoice = await this.choicesRepo.findOne({
      where: { session: { id: sessionId }, student: { id: studentId } },
      relations: { session: true, student: true },
    })

    if (existingChoice) {
      await this.choicesRepo.remove(existingChoice)
    }

    const assignments = this.cloneAssignments(session.assignments)
    delete assignments[String(studentId)]
    session.assignments = Object.keys(assignments).length ? assignments : null

    if (session.status === 'CLOSED') {
      session.resultsSnapshot = null
    }

    return this.sessionsRepo.save(session)
  }

  async deleteSession(id: number) {
    const session = await this.getSessionEntity(id)
    if (session.status === 'FINALIZED') throw new BadRequestException('Не можна видалити FINALIZED сесію')
    await this.sessionsRepo.delete({ id })
    return id
  }

  async resetOverrides(sessionId: number, studentId?: number) {
    const session = await this.getSessionEntity(sessionId)
    const assignments = this.cloneAssignments(session.assignments)

    if (!Object.keys(assignments).length) return session

    if (studentId) {
      delete assignments[String(studentId)]
      session.assignments = Object.keys(assignments).length ? assignments : null
    } else {
      session.assignments = null
    }

    session.resultsSnapshot = null
    return this.sessionsRepo.save(session)
  }

  async manualOverride(sessionId: number, studentId: number, semesters: Record<string, number[]>) {
    const session = await this.getSessionEntity(sessionId)
    if (session.status === 'FINALIZED') throw new BadRequestException('Сесія вже фіналізована')

    const assignments = this.cloneAssignments(session.assignments)
    const prev = assignments[String(studentId)] ?? {}
    const prevSemesters = prev.semesters && typeof prev.semesters === 'object' ? prev.semesters : {}
    const nextSemesters: Record<string, { planSubjectIds: number[]; source: SessionAssignmentSource }> = { ...prevSemesters }

    for (const [semester, ids] of Object.entries(semesters ?? {})) {
      nextSemesters[String(semester)] = {
        planSubjectIds: this.normalizeIdList(ids),
        source: 'MANUAL',
      }
    }

    assignments[String(studentId)] = {
      ...prev,
      semesters: nextSemesters,
    }

    session.assignments = assignments
    session.resultsSnapshot = null
    return this.sessionsRepo.save(session)
  }

  async getResults(sessionId: number) {
    const session = await this.getSessionEntity(sessionId)
    const choices = await this.choicesRepo.find({
      where: { session: { id: sessionId } },
      relations: { student: { group: true } as any, session: true },
      select: {
        id: true,
        submittedAt: true,
        status: true,
        prioritiesBySemester: true,
        student: {
          id: true,
          name: true,
          group: { id: true, name: true },
        },
      } as any,
    })
    const subjects = await this.planSubjectsRepo.find({
      where: { id: In(session.planSubjectIds ?? []) },
      relations: { cmk: true },
      select: {
        id: true,
        name: true,
        semesterNumber: true,
        electiveDescription: true,
        cmk: { id: true, name: true, shortName: true },
      } as any,
    })

    return {
      session,
      choices,
      subjects,
      resultsSnapshot: session.resultsSnapshot,
      assignments: session.assignments,
    }
  }

  private async computeAssignmentsForSubmittedStudents(session: ElectiveSessionEntity) {
    const manualStudentIds = this.getManualStudentIdsFromAssignments(session.assignments)
    const assignments = this.cloneAssignments(session.assignments)
    const planSubjects = await this.planSubjectsRepo.find({
      where: { id: In(session.planSubjectIds) },
      select: { id: true, semesterNumber: true, isElective: true },
    })
    const allowedBySemester = this.computeAllowedSubjectsBySemester(planSubjects)
    const studentContexts = await this.getStudentContexts(session.studentIds ?? [])
    const choices = await this.choicesRepo.find({
      where: { session: { id: session.id }, status: 'SUBMITTED' as any },
      relations: { student: true, session: true },
      select: {
        prioritiesBySemester: true,
        student: { id: true },
      } as any,
    })

    const submittedStudentIds = new Set(choices.map((choice) => choice.student.id))
    const noSubmission = (session.studentIds ?? []).filter((studentId) => !submittedStudentIds.has(studentId))

    for (const [semesterKey, allowedSubjectIds] of allowedBySemester.entries()) {
      const n = this.getNForSemester(session, semesterKey)
      if (n <= 0) continue

      const submittedStudentIdsWithoutManual = [...submittedStudentIds].filter((studentId) => !manualStudentIds.has(studentId))
      const prefsByStudent = new Map<number, number[]>()

      for (const choice of choices) {
        const studentId = choice.student.id
        if (manualStudentIds.has(studentId)) continue

        const prefs = (choice.prioritiesBySemester?.[semesterKey] ?? []).filter((id) => allowedSubjectIds.includes(id))
        prefsByStudent.set(studentId, prefs)
      }

      const allocated = new Map<number, number[]>()
      const cursor = new Map<number, number>()

      for (const [studentId, preferences] of prefsByStudent.entries()) {
        allocated.set(studentId, preferences.slice(0, n))
        cursor.set(studentId, Math.min(preferences.length, n))
      }

      let changed = true
      let guard = 0

      while (changed && guard < 50) {
        changed = false
        guard += 1

        const subjectGroupMap = new Map<number, Map<number, number[]>>()

        for (const [studentId, subjectIds] of allocated.entries()) {
          const context = studentContexts.get(studentId)
          if (!context) continue

          for (const subjectId of subjectIds) {
            if (!subjectGroupMap.has(subjectId)) subjectGroupMap.set(subjectId, new Map())
            const groupStudentIds = subjectGroupMap.get(subjectId)!
            if (!groupStudentIds.has(context.groupId)) groupStudentIds.set(context.groupId, [])
            groupStudentIds.get(context.groupId)!.push(studentId)
          }
        }

        const failingGroupsBySubjectId = new Map<number, Set<number>>()

        for (const subjectId of allowedSubjectIds) {
          const evaluation = this.buildSubjectEvaluation(session, semesterKey, subjectId, subjectGroupMap.get(subjectId) ?? new Map())
          failingGroupsBySubjectId.set(subjectId, new Set(evaluation.failingGroupIds))
        }

        for (const [studentId, currentSubjectIds] of allocated.entries()) {
          const context = studentContexts.get(studentId)
          const preferences = prefsByStudent.get(studentId) ?? []
          if (!context) continue

          const filteredSubjectIds = currentSubjectIds.filter(
            (subjectId) => !failingGroupsBySubjectId.get(subjectId)?.has(context.groupId),
          )

          if (filteredSubjectIds.length !== currentSubjectIds.length) {
            changed = true
          }

          let nextCursor = cursor.get(studentId) ?? 0
          const usedSubjectIds = new Set(filteredSubjectIds)

          while (filteredSubjectIds.length < n && nextCursor < preferences.length) {
            const candidateSubjectId = preferences[nextCursor]
            nextCursor += 1

            if (usedSubjectIds.has(candidateSubjectId)) continue
            if (failingGroupsBySubjectId.get(candidateSubjectId)?.has(context.groupId)) continue

            filteredSubjectIds.push(candidateSubjectId)
            usedSubjectIds.add(candidateSubjectId)
            changed = true
          }

          cursor.set(studentId, nextCursor)
          allocated.set(studentId, filteredSubjectIds)
        }
      }

      for (const studentId of submittedStudentIdsWithoutManual) {
        this.setStudentSemesterAssignment(assignments, studentId, semesterKey, allocated.get(studentId) ?? [], 'AUTO')
      }
    }

    return { assignments, studentContexts, allowedBySemester, noSubmission }
  }

  async distributeChosen(sessionId: number) {
    const session = await this.getSessionEntity(sessionId)
    if (session.status !== 'CLOSED') {
      throw new BadRequestException('Розподіл доступний лише для CLOSED сесії')
    }

    const { assignments, studentContexts, allowedBySemester, noSubmission } =
      await this.computeAssignmentsForSubmittedStudents(session)

    session.assignments = assignments
    session.resultsSnapshot = this.buildResultsSnapshot(session, assignments, noSubmission, studentContexts, allowedBySemester)
    return this.sessionsRepo.save(session)
  }

  async distributeNonChoosers(sessionId: number) {
    const session = await this.getSessionEntity(sessionId)
    if (session.status !== 'CLOSED') {
      throw new BadRequestException('Розподіл доступний лише для CLOSED сесії')
    }

    const { assignments, studentContexts, allowedBySemester, noSubmission } =
      await this.computeAssignmentsForSubmittedStudents(session)
    const manualStudentIds = this.getManualStudentIdsFromAssignments(assignments)
    const threshold = this.getSessionThreshold(session)
    const minSharedGroupSize = this.getSessionMinSharedGroupSize(session)

    for (const [semesterKey, allowedSubjectIds] of allowedBySemester.entries()) {
      const n = this.getNForSemester(session, semesterKey)
      if (n <= 0) continue

      const subjectTotals = new Map<number, number>()
      const groupSubjectTotals = new Map<string, number>()

      for (const [studentIdKey, entry] of Object.entries(assignments)) {
        const studentId = Number(studentIdKey)
        const context = studentContexts.get(studentId)
        const subjectIds = entry?.semesters?.[semesterKey]?.planSubjectIds ?? []

        if (!context) continue

        for (const subjectId of subjectIds.filter((id) => allowedSubjectIds.includes(id))) {
          subjectTotals.set(subjectId, (subjectTotals.get(subjectId) ?? 0) + 1)
          const key = `${context.groupId}:${subjectId}`
          groupSubjectTotals.set(key, (groupSubjectTotals.get(key) ?? 0) + 1)
        }
      }

      for (const studentId of noSubmission) {
        if (manualStudentIds.has(studentId)) continue

        const context = studentContexts.get(studentId)
        if (!context) continue

        const currentSubjectIds = assignments[String(studentId)]?.semesters?.[semesterKey]?.planSubjectIds ?? []
        if (currentSubjectIds.length >= n) continue

        const candidates = [...allowedSubjectIds]
          .filter((subjectId) => !currentSubjectIds.includes(subjectId))
          .map((subjectId) => {
            const totalCount = subjectTotals.get(subjectId) ?? 0
            const groupCount = groupSubjectTotals.get(`${context.groupId}:${subjectId}`) ?? 0
            const relevantCount = session.distributionMode === 'BY_GROUP' ? groupCount : totalCount
            const deficit = Math.max(0, threshold - relevantCount)
            const mixedPenalty =
              session.distributionMode === 'MIXED' && groupCount + 1 < minSharedGroupSize ? -500 : 0
            const score =
              (deficit === 0 ? 10_000 : 1_000 - deficit) +
              relevantCount * 10 +
              totalCount +
              mixedPenalty

            return { subjectId, score }
          })
          .sort((a, b) => b.score - a.score || a.subjectId - b.subjectId)

        const selectedSubjectIds = [...currentSubjectIds]

        for (const candidate of candidates) {
          if (selectedSubjectIds.length >= n) break
          selectedSubjectIds.push(candidate.subjectId)

          subjectTotals.set(candidate.subjectId, (subjectTotals.get(candidate.subjectId) ?? 0) + 1)
          const groupKey = `${context.groupId}:${candidate.subjectId}`
          groupSubjectTotals.set(groupKey, (groupSubjectTotals.get(groupKey) ?? 0) + 1)
        }

        this.setStudentSemesterAssignment(assignments, studentId, semesterKey, selectedSubjectIds, 'AUTO')
      }
    }

    session.assignments = assignments
    session.resultsSnapshot = this.buildResultsSnapshot(session, assignments, noSubmission, studentContexts, allowedBySemester)
    return this.sessionsRepo.save(session)
  }

  async finalize(sessionId: number) {
    const session = await this.getSessionEntity(sessionId)
    if (session.status !== 'CLOSED') {
      throw new BadRequestException('Фіналізація доступна лише для CLOSED сесії')
    }

    const assignments = this.cloneAssignments(session.assignments)
    if (!Object.keys(assignments).length) {
      throw new BadRequestException('Немає розподілу для фіналізації')
    }

    const studentContexts = await this.getStudentContexts(session.studentIds ?? [])
    const submittedChoices = await this.choicesRepo.find({
      where: { session: { id: sessionId }, status: 'SUBMITTED' as any },
      relations: { student: true },
      select: { student: { id: true } } as any,
    })
    const submittedStudentIds = new Set(submittedChoices.map((choice) => choice.student.id))
    const noSubmission = (session.studentIds ?? []).filter((studentId) => !submittedStudentIds.has(studentId))
    const planSubjects = await this.getSelectedPlanSubjects(session)
    const allowedBySemester = this.computeAllowedSubjectsBySemester(planSubjects)
    const resultsSnapshot = this.buildResultsSnapshot(session, assignments, noSubmission, studentContexts, allowedBySemester)
    const planSubjectById = new Map(planSubjects.map((planSubject) => [planSubject.id, planSubject]))
    const groupPlanIdByGroupId = new Map<number, number>()

    for (const context of studentContexts.values()) {
      groupPlanIdByGroupId.set(context.groupId, context.planId)
    }

    const allOfferings = Object.values(resultsSnapshot.semesters ?? {}).flatMap((semester) => semester.offerings ?? [])

    for (const offering of allOfferings) {
      const planSubject = planSubjectById.get(offering.planSubjectId)
      if (!planSubject) continue

      const createdLessonsBySignature = new Map<string, GroupLoadLessonEntity[]>()

      for (const groupId of offering.groupIds) {
        const planId = groupPlanIdByGroupId.get(groupId)
        if (!planId) continue

        const lessonTemplates = this.groupLoadLessonsService
          .convertPlanSubjectsToGroupLoadLessons([planSubject], groupId, planId)
          .map((lesson) => ({
            ...lesson,
            subgroupNumber: offering.subgroupNumber,
          }))

        for (const template of lessonTemplates as any[]) {
          const existing = await this.groupLoadLessonsRepo.findOne({
            where: {
              group: { id: groupId } as any,
              planSubjectId: { id: offering.planSubjectId } as any,
              typeEn: template.typeEn,
              semester: template.semester,
              subgroupNumber: template.subgroupNumber ?? null,
            } as any,
            relations: { students: true },
          })

          const savedLesson =
            existing ??
            (await this.groupLoadLessonsRepo.save(
              this.groupLoadLessonsRepo.create(template as any) as unknown as GroupLoadLessonEntity,
            ))
          const signature = `${savedLesson.typeEn}:${savedLesson.hours}:${savedLesson.semester}:${savedLesson.subgroupNumber ?? 'main'}`

          if (!createdLessonsBySignature.has(signature)) {
            createdLessonsBySignature.set(signature, [])
          }

          createdLessonsBySignature.get(signature)!.push(savedLesson)
        }
      }

      if (offering.groupIds.length > 1) {
        const streamName = `Elective ${session.id} • ${offering.planSubjectId} • ${offering.semester} • ${offering.subgroupNumber ?? 1}`
        const stream = await this.streamsRepo.save(
          this.streamsRepo.create({
            name: streamName,
            groups: offering.groupIds.map((groupId) => ({ id: groupId })) as any,
          }),
        )

        for (const lessons of createdLessonsBySignature.values()) {
          if (lessons.length < 2) continue

          await this.groupLoadLessonsService.addLessonsToStream(stream.id, {
            streamId: stream.id,
            streamName: stream.name,
            lessonsIds: lessons.map((lesson) => lesson.id),
          })
        }
      }

      for (const groupId of offering.groupIds) {
        const groupStudentIds = offering.groupStudentIds[String(groupId)] ?? []
        if (!groupStudentIds.length) continue

        const lessons = await this.groupLoadLessonsRepo.find({
          where: {
            group: { id: groupId } as any,
            planSubjectId: { id: offering.planSubjectId } as any,
            semester: Number(offering.semester),
            subgroupNumber: offering.subgroupNumber ?? null,
          } as any,
          relations: { students: true },
        })

        for (const lesson of lessons) {
          const existingStudentIds = new Set((lesson.students ?? []).map((student) => student.id))
          const missingStudentIds = groupStudentIds.filter((studentId) => !existingStudentIds.has(studentId))

          if (!missingStudentIds.length) continue

          await this.groupLoadLessonsRepo
            .createQueryBuilder()
            .relation(GroupLoadLessonEntity, 'students')
            .of(lesson.id)
            .add(missingStudentIds)
        }
      }
    }

    session.assignments = assignments
    session.resultsSnapshot = resultsSnapshot
    session.status = 'FINALIZED'
    return this.sessionsRepo.save(session)
  }
}
