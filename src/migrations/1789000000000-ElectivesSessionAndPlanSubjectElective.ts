import { MigrationInterface, QueryRunner } from 'typeorm'

export class ElectivesSessionAndPlanSubjectElective1789000000000 implements MigrationInterface {
  name = 'ElectivesSessionAndPlanSubjectElective1789000000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "plan-subjects"
        ADD COLUMN IF NOT EXISTS "isElective" boolean NOT NULL DEFAULT false,
        ADD COLUMN IF NOT EXISTS "electiveDescription" text NULL,
        ADD COLUMN IF NOT EXISTS "electiveDriveFolderId" text NULL;
    `)

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "plan_subject_attachments" (
        "id" SERIAL NOT NULL,
        "planSubjectId" integer NOT NULL,
        "driveFileId" character varying NOT NULL,
        "name" character varying NOT NULL,
        "mimeType" character varying NOT NULL,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_plan_subject_attachments_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_plan_subject_attachments_planSubjectId" FOREIGN KEY ("planSubjectId") REFERENCES "plan-subjects"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      );
    `)

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "elective_sessions" (
        "id" SERIAL NOT NULL,
        "name" character varying NOT NULL,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "createdByUserId" integer NOT NULL,
        "status" character varying NOT NULL DEFAULT 'DRAFT',
        "minStudentsThreshold" integer NOT NULL DEFAULT 10,
        "closesAt" TIMESTAMPTZ NOT NULL,
        "maxElectivesPerSemester" jsonb NOT NULL DEFAULT '{}'::jsonb,
        "scopeNote" text NULL,
        "studentIds" integer[] NOT NULL DEFAULT ARRAY[]::integer[],
        "planSubjectIds" integer[] NOT NULL DEFAULT ARRAY[]::integer[],
        "resultsSnapshot" jsonb NULL,
        "assignments" jsonb NULL,
        CONSTRAINT "PK_elective_sessions_id" PRIMARY KEY ("id")
      );
    `)

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_elective_sessions_studentIds_gin" ON "elective_sessions" USING GIN ("studentIds");
    `)
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_elective_sessions_planSubjectIds_gin" ON "elective_sessions" USING GIN ("planSubjectIds");
    `)

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "elective_student_choices" (
        "id" SERIAL NOT NULL,
        "sessionId" integer NOT NULL,
        "studentId" integer NOT NULL,
        "submittedAt" TIMESTAMPTZ NULL,
        "status" character varying NOT NULL DEFAULT 'SUBMITTED',
        "prioritiesBySemester" jsonb NOT NULL DEFAULT '{}'::jsonb,
        CONSTRAINT "PK_elective_student_choices_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_elective_student_choice_session_student" UNIQUE ("sessionId","studentId"),
        CONSTRAINT "FK_elective_student_choices_sessionId" FOREIGN KEY ("sessionId") REFERENCES "elective_sessions"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
        CONSTRAINT "FK_elective_student_choices_studentId" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      );
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "elective_student_choices";`)
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_elective_sessions_planSubjectIds_gin";`)
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_elective_sessions_studentIds_gin";`)
    await queryRunner.query(`DROP TABLE IF EXISTS "elective_sessions";`)
    await queryRunner.query(`DROP TABLE IF EXISTS "plan_subject_attachments";`)
    await queryRunner.query(`
      ALTER TABLE "plan-subjects"
        DROP COLUMN IF EXISTS "electiveDriveFolderId",
        DROP COLUMN IF EXISTS "electiveDescription",
        DROP COLUMN IF EXISTS "isElective";
    `)
  }
}

