import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { ElectiveSessionEntity, ElectiveSessionStatus } from './entities/elective-session.entity'
import { ElectiveStudentChoiceEntity } from './entities/elective-student-choice.entity'
import { CreateElectiveSessionDto } from './dto/create-elective-session.dto'
import { StudentEntity } from '../core/students/entities/student.entity'
import { GroupEntity } from '../core/groups/entities/group.entity'
import { PlanSubjectEntity } from '../plans/plan-subjects/entities/plan-subject.entity'
import { GroupLoadLessonEntity } from '../schedule/group-load-lessons/entities/group-load-lesson.entity'
import { GroupLoadLessonsService } from '../schedule/group-load-lessons/group-load-lessons.service'

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

    private groupLoadLessonsService: GroupLoadLessonsService,
  ) {}

  private getManualStudentIdsFromAssignments(assignments: any | undefined): Set<number> {
    const res = new Set<number>()
    if (!assignments || typeof assignments !== 'object') return res
    for (const [studentIdStr, entry] of Object.entries(assignments)) {
      const studentId = Number(studentIdStr)
      if (!studentId || typeof entry !== 'object' || !entry) continue
      const semesters = (entry as any).semesters
      if (!semesters || typeof semesters !== 'object') continue
      for (const semEntry of Object.values(semesters)) {
        if ((semEntry as any)?.source === 'MANUAL') {
          res.add(studentId)
          break
        }
      }
    }
    return res
  }

  async createSession(dto: CreateElectiveSessionDto, createdByUserId: number) {
    const closesAt = new Date(dto.closesAt)
    if (Number.isNaN(closesAt.getTime())) throw new BadRequestException('Невірний closesAt')

    // Validate students exist
    const studentsCount = await this.studentsRepo.count({ where: { id: dto.studentIds as any } })
    if (studentsCount !== dto.studentIds.length) {
      throw new BadRequestException('Список студентів містить неіснуючі id')
    }

    const session = this.sessionsRepo.create({
      name: dto.name,
      createdByUserId,
      closesAt,
      minStudentsThreshold: dto.minStudentsThreshold ?? 10,
      maxElectivesPerSemester: dto.maxElectivesPerSemester ?? {},
      scopeNote: dto.scopeNote ?? null,
      studentIds: dto.studentIds,
      planSubjectIds: dto.planSubjectIds,
      status: 'DRAFT',
    })

    return this.sessionsRepo.save(session)
  }

  async getSession(id: number) {
    const session = await this.sessionsRepo.findOne({ where: { id } })
    if (!session) throw new NotFoundException('Сесію не знайдено')
    return session
  }

  async listActiveSessionsForStudent(studentId: number) {
    // Using ANY on int[]; TypeORM doesn't support nicely, so raw query
    return this.sessionsRepo.query(
      `SELECT * FROM elective_sessions WHERE status = 'OPEN' AND $1 = ANY("studentIds") ORDER BY "createdAt" DESC`,
      [studentId],
    )
  }

  async getOptions(sessionId: number, studentId: number) {
    const session = await this.getSession(sessionId)
    if (session.status !== 'OPEN') throw new BadRequestException('Сесія не відкрита')
    if (!session.studentIds.includes(studentId)) throw new BadRequestException('Вибір недоступний для цього студента')

    const subjects = await this.planSubjectsRepo.find({
      where: { id: session.planSubjectIds as any },
      relations: { cmk: true, plan: true },
    })
    return { session, subjects }
  }

  async openSession(id: number) {
    const session = await this.getSession(id)
    if (session.status !== 'DRAFT') throw new BadRequestException('Можна відкрити тільки DRAFT сесію')
    session.status = 'OPEN'
    return this.sessionsRepo.save(session)
  }

  async closeSession(id: number) {
    const session = await this.getSession(id)
    if (session.status !== 'OPEN') throw new BadRequestException('Можна закрити тільки OPEN сесію')
    session.status = 'CLOSED'
    return this.sessionsRepo.save(session)
  }

  async patchChoice(sessionId: number, studentId: number, prioritiesBySemester: Record<string, number[]>) {
    const session = await this.getSession(sessionId)
    if (session.status !== 'OPEN') throw new BadRequestException('Сесія не відкрита')
    if (!session.studentIds.includes(studentId)) throw new BadRequestException('Вибір недоступний для цього студента')

    // validate subject ids are allowed
    for (const [semester, ids] of Object.entries(prioritiesBySemester ?? {})) {
      const uniq = new Set(ids)
      if (uniq.size !== ids.length) throw new BadRequestException(`Дублікати в семестрі ${semester}`)
      for (const id of ids) {
        if (!session.planSubjectIds.includes(id)) throw new BadRequestException('Є дисципліни поза allow-list')
      }
    }

    const student = await this.studentsRepo.findOne({ where: { id: studentId }, select: { id: true } })
    if (!student) throw new BadRequestException('Студента не знайдено')

    const existing = await this.choicesRepo.findOne({
      where: { session: { id: sessionId }, student: { id: studentId } },
      relations: { session: true, student: true },
    })

    const payload = existing
      ? { ...existing, prioritiesBySemester, submittedAt: new Date(), status: 'SUBMITTED' as const }
      : this.choicesRepo.create({
          session: { id: sessionId } as any,
          student: { id: studentId } as any,
          prioritiesBySemester,
          submittedAt: new Date(),
          status: 'SUBMITTED',
        })

    return this.choicesRepo.save(payload as any)
  }

  async deleteSession(id: number) {
    const session = await this.getSession(id)
    if (session.status === 'FINALIZED') throw new BadRequestException('Не можна видалити FINALIZED сесію')
    await this.sessionsRepo.delete({ id })
    return id
  }

  async resetOverrides(sessionId: number, studentId?: number) {
    const session = await this.getSession(sessionId)
    if (!session.assignments) return session
    const assignments = { ...(session.assignments as any) }
    if (studentId) {
      delete assignments[String(studentId)]
    } else {
      // remove all manual entries by clearing entire assignments; admin can re-distribute
      session.assignments = null
      return this.sessionsRepo.save(session)
    }
    session.assignments = assignments
    return this.sessionsRepo.save(session)
  }

  async manualOverride(sessionId: number, studentId: number, semesters: Record<string, number[]>) {
    const session = await this.getSession(sessionId)
    if (session.status === 'FINALIZED') throw new BadRequestException('Сесія вже фіналізована')

    const assignments = (session.assignments && typeof session.assignments === 'object' ? session.assignments : {}) as any
    const prev = assignments[String(studentId)] ?? {}
    const prevSemesters = prev.semesters && typeof prev.semesters === 'object' ? prev.semesters : {}

    const newSemesters: any = { ...prevSemesters }
    for (const [sem, ids] of Object.entries(semesters ?? {})) {
      newSemesters[String(sem)] = { planSubjectIds: ids ?? [], source: 'MANUAL' }
    }

    assignments[String(studentId)] = { ...prev, semesters: newSemesters }
    session.assignments = assignments
    return this.sessionsRepo.save(session)
  }

  async getResults(sessionId: number) {
    const session = await this.getSession(sessionId)
    const choices = await this.choicesRepo.find({
      where: { session: { id: sessionId } },
      relations: { student: { group: true } as any, session: true },
      select: {
        id: true,
        submittedAt: true,
        status: true,
        prioritiesBySemester: true,
        student: { id: true, name: true, group: { id: true, name: true } },
      } as any,
    })
    return { session, choices, resultsSnapshot: session.resultsSnapshot, assignments: session.assignments }
  }

  private computeAllowedSubjectsBySemester(planSubjects: PlanSubjectEntity[]) {
    const map = new Map<string, number[]>()
    for (const ps of planSubjects) {
      const sem = ps.semesterNumber
      if (!sem) continue
      const key = String(sem)
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(ps.id)
    }
    return map
  }

  private getNForSemester(session: ElectiveSessionEntity, semesterKey: string): number {
    const n = session.maxElectivesPerSemester?.[semesterKey]
    return typeof n === 'number' && n >= 0 ? n : 0
  }

  async distributeChosen(sessionId: number) {
    const session = await this.getSession(sessionId)
    if (session.status !== 'CLOSED') throw new BadRequestException('Розподіл доступний лише для CLOSED сесії')

    const manualStudentIds = this.getManualStudentIdsFromAssignments(session.assignments)

    const planSubjects = await this.planSubjectsRepo.find({
      where: { id: session.planSubjectIds as any },
      select: { id: true, semesterNumber: true, isElective: true },
    })
    const allowedBySemester = this.computeAllowedSubjectsBySemester(planSubjects)

    const choices = await this.choicesRepo.find({
      where: { session: { id: sessionId }, status: 'SUBMITTED' as any },
      relations: { student: true, session: true },
      select: { id: true, prioritiesBySemester: true, student: { id: true } } as any,
    })

    const submittedStudentIds = new Set(choices.map((c) => c.student.id))
    const noSubmission = session.studentIds.filter((id) => !submittedStudentIds.has(id))

    const assignments: any = session.assignments && typeof session.assignments === 'object' ? session.assignments : {}
    const resultsSnapshot: any = { semesters: {}, noSubmission, unassigned: [] as number[] }

    for (const [semKey, allowedSubjectIds] of allowedBySemester.entries()) {
      const n = this.getNForSemester(session, semKey)
      if (n <= 0) continue

      // initial allocations for non-manual students only
      const prefsByStudent = new Map<number, number[]>()
      for (const choice of choices) {
        const sid = choice.student.id
        if (manualStudentIds.has(sid)) continue
        const prefs = (choice.prioritiesBySemester?.[semKey] ?? []).filter((id) => allowedSubjectIds.includes(id))
        prefsByStudent.set(sid, prefs)
      }

      const allocated = new Map<number, number[]>() // studentId -> planSubjectIds (size<=n)
      const cursor = new Map<number, number>() // next pref idx
      for (const [sid, prefs] of prefsByStudent.entries()) {
        allocated.set(sid, prefs.slice(0, n))
        cursor.set(sid, n)
      }

      const threshold = session.minStudentsThreshold ?? 10
      let changed = true
      let guard = 0
      while (changed && guard++ < 50) {
        changed = false
        const counts = new Map<number, number>()
        for (const ids of allocated.values()) {
          for (const id of ids) counts.set(id, (counts.get(id) ?? 0) + 1)
        }

        const failing = new Set<number>()
        for (const [id, cnt] of counts.entries()) {
          if (cnt < threshold) failing.add(id)
        }

        if (!failing.size) {
          resultsSnapshot.semesters[semKey] = {
            threshold,
            counts: Object.fromEntries(counts),
            failing: [],
          }
          break
        }

        // remove failing and try to fill
        for (const [sid, ids] of allocated.entries()) {
          const before = ids.length
          const kept = ids.filter((id) => !failing.has(id))
          if (kept.length !== before) changed = true

          const prefs = prefsByStudent.get(sid) ?? []
          let idx = cursor.get(sid) ?? 0
          const used = new Set(kept)
          while (kept.length < n && idx < prefs.length) {
            const cand = prefs[idx++]
            if (!failing.has(cand) && !used.has(cand)) {
              kept.push(cand)
              used.add(cand)
              changed = true
            }
          }
          cursor.set(sid, idx)
          allocated.set(sid, kept)
        }

        if (!changed) {
          // can't improve further; store snapshot with failing
          const counts2 = new Map<number, number>()
          for (const ids of allocated.values()) for (const id of ids) counts2.set(id, (counts2.get(id) ?? 0) + 1)
          resultsSnapshot.semesters[semKey] = {
            threshold,
            counts: Object.fromEntries(counts2),
            failing: Array.from(failing),
          }
          break
        }
      }

      // persist allocations as AUTO
      for (const [sid, ids] of allocated.entries()) {
        if (!assignments[String(sid)]) assignments[String(sid)] = { semesters: {} }
        const prev = assignments[String(sid)].semesters?.[semKey]
        if (prev?.source === 'MANUAL') continue
        assignments[String(sid)].semesters[semKey] = { planSubjectIds: ids, source: 'AUTO' }
        if (ids.length < n) resultsSnapshot.unassigned.push(sid)
      }
    }

    session.assignments = assignments
    session.resultsSnapshot = resultsSnapshot
    return this.sessionsRepo.save(session)
  }

  async distributeNonChoosers(sessionId: number) {
    const session = await this.getSession(sessionId)
    if (session.status !== 'CLOSED') throw new BadRequestException('Розподіл доступний лише для CLOSED сесії')

    const manualStudentIds = this.getManualStudentIdsFromAssignments(session.assignments)
    const assignments: any = session.assignments && typeof session.assignments === 'object' ? session.assignments : {}
    const resultsSnapshot: any = session.resultsSnapshot && typeof session.resultsSnapshot === 'object' ? session.resultsSnapshot : { semesters: {} }

    const choices = await this.choicesRepo.find({
      where: { session: { id: sessionId }, status: 'SUBMITTED' as any },
      relations: { student: true },
      select: { student: { id: true } } as any,
    })
    const submittedStudentIds = new Set(choices.map((c) => c.student.id))
    const noSubmission = session.studentIds.filter((id) => !submittedStudentIds.has(id))

    const planSubjects = await this.planSubjectsRepo.find({
      where: { id: session.planSubjectIds as any },
      select: { id: true, semesterNumber: true },
    })
    const allowedBySemester = this.computeAllowedSubjectsBySemester(planSubjects)

    for (const [semKey, allowedSubjectIds] of allowedBySemester.entries()) {
      const n = this.getNForSemester(session, semKey)
      if (n <= 0) continue

      // compute current counts from assignments for this semester
      const counts = new Map<number, number>()
      for (const [sidStr, entry] of Object.entries(assignments)) {
        const semEntry = (entry as any)?.semesters?.[semKey]
        if (!semEntry?.planSubjectIds) continue
        for (const psid of semEntry.planSubjectIds) {
          counts.set(psid, (counts.get(psid) ?? 0) + 1)
        }
      }

      const threshold = session.minStudentsThreshold ?? 10
      const deficits = allowedSubjectIds
        .map((id) => ({ id, deficit: threshold - (counts.get(id) ?? 0) }))
        .filter((x) => x.deficit > 0)
        .sort((a, b) => a.deficit - b.deficit)

      for (const sid of noSubmission) {
        if (manualStudentIds.has(sid)) continue
        if (!assignments[String(sid)]) assignments[String(sid)] = { semesters: {} }
        const semEntry = assignments[String(sid)].semesters?.[semKey]
        if (semEntry?.source === 'MANUAL') continue
        const already: number[] = semEntry?.planSubjectIds ?? []
        if (already.length >= n) continue

        const chosen: number[] = [...already]
        for (const d of deficits) {
          if (chosen.length >= n) break
          if (d.deficit <= 0) continue
          if (!chosen.includes(d.id)) {
            chosen.push(d.id)
            d.deficit -= 1
          }
        }
        assignments[String(sid)].semesters[semKey] = { planSubjectIds: chosen, source: 'AUTO' }
      }
    }

    resultsSnapshot.noSubmission = noSubmission
    session.assignments = assignments
    session.resultsSnapshot = resultsSnapshot
    return this.sessionsRepo.save(session)
  }

  async finalize(sessionId: number) {
    const session = await this.getSession(sessionId)
    if (session.status !== 'CLOSED') throw new BadRequestException('Фіналізація доступна лише для CLOSED сесії')
    if (!session.assignments) throw new BadRequestException('Немає розподілу для фіналізації')

    // Load students with groups and education plan
    const students = await this.studentsRepo.find({
      where: { id: session.studentIds as any },
      relations: { group: { educationPlan: true } as any },
      select: { id: true, group: { id: true, educationPlan: { id: true } } } as any,
    })
    const studentToGroup = new Map<number, { groupId: number; planId: number }>()
    for (const s of students) {
      if (!s.group?.id || !s.group?.educationPlan?.id) continue
      studentToGroup.set(s.id, { groupId: s.group.id, planId: s.group.educationPlan.id })
    }

    // Determine per group which planSubjectIds to materialize
    const groupToSubjectIds = new Map<number, Set<number>>()
    const assignments: any = session.assignments
    for (const [sidStr, entry] of Object.entries(assignments)) {
      const sid = Number(sidStr)
      const grp = studentToGroup.get(sid)
      if (!grp) continue
      const semesters = (entry as any)?.semesters ?? {}
      for (const semEntry of Object.values(semesters)) {
        const ids = (semEntry as any)?.planSubjectIds ?? []
        if (!groupToSubjectIds.has(grp.groupId)) groupToSubjectIds.set(grp.groupId, new Set())
        ids.forEach((id: number) => groupToSubjectIds.get(grp.groupId)!.add(id))
      }
    }

    // Materialize lessons per group
    for (const [groupId, subjectIdsSet] of groupToSubjectIds.entries()) {
      const subjectIds = Array.from(subjectIdsSet)
      const anyStudent = students.find((s) => s.group?.id === groupId)
      const planId = anyStudent?.group?.educationPlan?.id
      if (!planId) continue

      const planSubjects = await this.planSubjectsRepo.find({
        where: { id: subjectIds as any, plan: { id: planId } as any, isElective: true as any },
        relations: { cmk: true },
        select: { cmk: { id: true } } as any,
      })

      const newLessons = this.groupLoadLessonsService.convertPlanSubjectsToGroupLoadLessons(planSubjects, groupId, planId)
      // save if not exists
      for (const l of newLessons as any) {
        const exists = await this.groupLoadLessonsRepo.findOne({
          where: {
            group: { id: groupId } as any,
            planSubjectId: { id: l.planSubjectId.id } as any,
            typeEn: l.typeEn,
            semester: l.semester,
          } as any,
          select: { id: true } as any,
        })
        if (!exists) {
          const created = this.groupLoadLessonsRepo.create(l)
          await this.groupLoadLessonsRepo.save(created)
        }
      }
    }

    // Fill student_lessons (join table) for assigned subjects
    for (const [sidStr, entry] of Object.entries(assignments)) {
      const sid = Number(sidStr)
      const grp = studentToGroup.get(sid)
      if (!grp) continue
      const semesters = (entry as any)?.semesters ?? {}
      const subjectIds: number[] = []
      for (const semEntry of Object.values(semesters)) {
        const ids = (semEntry as any)?.planSubjectIds ?? []
        ids.forEach((id: number) => subjectIds.push(id))
      }
      if (!subjectIds.length) continue

      const lessons = await this.groupLoadLessonsRepo.find({
        where: { group: { id: grp.groupId } as any, planSubjectId: { id: subjectIds as any } as any } as any,
        select: { id: true } as any,
      })
      if (!lessons.length) continue

      const values = lessons.map((l) => `(${l.id}, ${sid})`).join(',')
      await this.groupLoadLessonsRepo.query(`
        INSERT INTO student_lessons (lesson_id, student_id)
        VALUES ${values}
        ON CONFLICT DO NOTHING
      `)
    }

    session.status = 'FINALIZED'
    return this.sessionsRepo.save(session)
  }
}

