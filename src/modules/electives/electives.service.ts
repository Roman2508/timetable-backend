import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { In, Repository } from 'typeorm'

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

  private async getSessionEntity(id: number) {
    const entity = await this.sessionsRepo.findOne({ where: { id } })
    if (!entity) throw new NotFoundException('РЎРµСЃС–СЋ РЅРµ Р·РЅР°Р№РґРµРЅРѕ')
    return entity
  }

  private async validatePrioritiesBySemester(session: ElectiveSessionEntity, prioritiesBySemester: Record<string, number[]>) {
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
        if (!allowedIds.includes(id)) throw new BadRequestException(`У семестрі ${semester} є дисципліни поза allow-list`)
      }

      for (const allowedId of allowedIds) {
        if (!uniq.has(allowedId)) {
          throw new BadRequestException(`У семестрі ${semester} потрібно проставити повний порядок пріоритетів`)
        }
      }
    }

    for (const semester of Object.keys(prioritiesBySemester ?? {})) {
      if (!allowedBySemester.has(semester)) {
        throw new BadRequestException(`Семестр ${semester} не входить до цієї сесії`)
      }
    }
  }

  private async upsertStudentChoice(sessionId: number, studentId: number, prioritiesBySemester: Record<string, number[]>) {
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

  private async buildSessionDetails(session: ElectiveSessionEntity) {
    const students = await this.studentsRepo.find({
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
            status: true,
            student: { id: true },
          } as any,
        })
      : []

    const submissionByStudentId = new Map<number, { submittedAt?: Date | null }>()
    for (const choice of submittedChoices) {
      if (choice.student?.id) {
        submissionByStudentId.set(choice.student.id, { submittedAt: choice.submittedAt })
      }
    }

    const groupsMap = new Map<number, any>()
    for (const student of students) {
      if (!student.group?.id) continue

      const existingGroup = groupsMap.get(student.group.id)
      if (existingGroup) {
        existingGroup.studentCount += 1
        continue
      }

      groupsMap.set(student.group.id, {
        id: student.group.id,
        name: student.group.name,
        categoryName: student.group.category?.name ?? null,
        courseNumber: student.group.courseNumber ?? null,
        yearOfAdmission: student.group.yearOfAdmission ?? null,
        formOfEducation: student.group.formOfEducation ?? null,
        studentCount: 1,
      })
    }

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
      groups: Array.from(groupsMap.values()).sort((a, b) => a.name.localeCompare(b.name, 'uk')),
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
    if (!dto.studentIds?.length) throw new BadRequestException('Потрібно обрати хоча б одного студента')
    if (!dto.planSubjectIds?.length) throw new BadRequestException('Потрібно обрати хоча б одну вибіркову дисципліну')

    const studentIds = Array.from(new Set((dto.studentIds ?? []).map(Number).filter(Boolean)))
    const planSubjectIds = Array.from(new Set((dto.planSubjectIds ?? []).map(Number).filter(Boolean)))

    // Validate students exist
    const studentsCount = await this.studentsRepo.count({ where: { id: In(studentIds) } })
    if (studentsCount !== studentIds.length) {
      throw new BadRequestException('Список студентів містить неіснуючі id')
    }

    const planSubjectsCount = await this.planSubjectsRepo.count({ where: { id: In(planSubjectIds), isElective: true } as any })
    if (planSubjectsCount !== planSubjectIds.length) {
      throw new BadRequestException('Список вибіркових дисциплін містить невалідні id')
    }

    const session = this.sessionsRepo.create({
      name: dto.name,
      createdByUserId,
      closesAt,
      minStudentsThreshold: dto.minStudentsThreshold ?? 10,
      maxElectivesPerSemester: dto.maxElectivesPerSemester ?? {},
      scopeNote: dto.scopeNote ?? null,
      studentIds,
      planSubjectIds,
      status: 'DRAFT',
    })

    return this.sessionsRepo.save(session)
  }

  async getSession(id: number) {
    const session = await this.getSessionEntity(id)
    if (!session) throw new NotFoundException('Сесію не знайдено')
    return this.buildSessionDetails(session)
  }

  async listSessions() {
    return this.sessionsRepo.find({ order: { createdAt: 'DESC' as any } })
  }

  async listActiveSessionsForStudent(studentId: number) {
    const sessions = await this.sessionsRepo.find({
      order: { createdAt: 'DESC' as any },
    })

    const relevantSessions = sessions.filter((session) => session.studentIds.includes(studentId))

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
    if (!session.studentIds.includes(studentId)) throw new BadRequestException('Вибір недоступний для цього студента')

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

    const subjects = await this.planSubjectsRepo.find({
      where: { id: In(session.planSubjectIds) },
      relations: { cmk: true, plan: true },
    })

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
    if (!['DRAFT', 'CLOSED'].includes(session.status))
      throw new BadRequestException('Можна відкрити тільки DRAFT або CLOSED сесію')

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
    if (!session.studentIds.includes(studentId)) throw new BadRequestException('Вибір недоступний для цього студента')
    await this.validatePrioritiesBySemester(session, prioritiesBySemester)

    const student = await this.studentsRepo.findOne({ where: { id: studentId }, select: { id: true } })
    if (!student) throw new BadRequestException('Студента не знайдено')

    return this.upsertStudentChoice(sessionId, studentId, prioritiesBySemester)
  }

  async patchChoiceByAdmin(sessionId: number, studentId: number, prioritiesBySemester: Record<string, number[]>) {
    const session = await this.getSessionEntity(sessionId)
    if (session.status === 'FINALIZED') throw new BadRequestException('Сесія вже фіналізована')
    if (!session.studentIds.includes(studentId)) throw new BadRequestException('Вибір недоступний для цього студента')

    await this.validatePrioritiesBySemester(session, prioritiesBySemester)

    const student = await this.studentsRepo.findOne({ where: { id: studentId }, select: { id: true } })
    if (!student) throw new BadRequestException('Студента не знайдено')

    return this.upsertStudentChoice(sessionId, studentId, prioritiesBySemester)
  }

  async clearStudentChoice(sessionId: number, studentId: number) {
    const session = await this.getSessionEntity(sessionId)
    if (session.status === 'FINALIZED') throw new BadRequestException('Не можна очистити вибір у FINALIZED сесії')
    if (!session.studentIds.includes(studentId)) throw new BadRequestException('Студент не належить до цієї сесії')

    const existingChoice = await this.choicesRepo.findOne({
      where: { session: { id: sessionId }, student: { id: studentId } },
      relations: { session: true, student: true },
    })

    if (existingChoice) {
      await this.choicesRepo.remove(existingChoice)
    }

    if (session.assignments && typeof session.assignments === 'object') {
      const assignments = { ...(session.assignments as any) }
      delete assignments[String(studentId)]
      session.assignments = Object.keys(assignments).length ? assignments : null
    }

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
    const session = await this.getSessionEntity(sessionId)
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
    const session = await this.getSessionEntity(sessionId)
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
    const session = await this.getSessionEntity(sessionId)
    if (session.status !== 'CLOSED') throw new BadRequestException('Розподіл доступний лише для CLOSED сесії')

    const manualStudentIds = this.getManualStudentIdsFromAssignments(session.assignments)

    const planSubjects = await this.planSubjectsRepo.find({
      where: { id: In(session.planSubjectIds) },
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
    const session = await this.getSessionEntity(sessionId)
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
      where: { id: In(session.planSubjectIds) },
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
    const session = await this.getSessionEntity(sessionId)
    if (session.status !== 'CLOSED') throw new BadRequestException('Фіналізація доступна лише для CLOSED сесії')
    if (!session.assignments) throw new BadRequestException('Немає розподілу для фіналізації')

    // Load students with groups and education plan
    const students = await this.studentsRepo.find({
      where: { id: In(session.studentIds) },
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
        where: { id: In(subjectIds), plan: { id: planId } as any, isElective: true as any },
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

    // Fill student_lessons via TypeORM relation API
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
        where: { group: { id: grp.groupId } as any, planSubjectId: { id: In(subjectIds) } as any } as any,
        relations: { students: true },
        select: { id: true, students: { id: true } } as any,
      })
      if (!lessons.length) continue

      for (const lesson of lessons) {
        const isAlreadyAssigned = lesson.students?.some((student) => student.id === sid)
        if (isAlreadyAssigned) continue

        await this.groupLoadLessonsRepo
          .createQueryBuilder()
          .relation(GroupLoadLessonEntity, 'students')
          .of(lesson.id)
          .add(sid)
      }
    }

    session.status = 'FINALIZED'
    return this.sessionsRepo.save(session)
  }
}

