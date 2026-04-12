import { MigrationInterface, QueryRunner } from 'typeorm'

export class ElectiveSessionsMultiGroupSettings1790100000000 implements MigrationInterface {
  name = 'ElectiveSessionsMultiGroupSettings1790100000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "elective_sessions"
        ADD COLUMN IF NOT EXISTS "groupIds" integer[] NOT NULL DEFAULT ARRAY[]::integer[],
        ADD COLUMN IF NOT EXISTS "distributionMode" character varying NOT NULL DEFAULT 'BY_GROUP',
        ADD COLUMN IF NOT EXISTS "maxStudentsPerOffering" integer NOT NULL DEFAULT 30,
        ADD COLUMN IF NOT EXISTS "minSharedGroupSize" integer NOT NULL DEFAULT 5;
    `)

    await queryRunner.query(`
      ALTER TABLE "elective_sessions"
        ALTER COLUMN "minStudentsThreshold" SET DEFAULT 15;
    `)

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_elective_sessions_groupIds_gin" ON "elective_sessions" USING GIN ("groupIds");
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_elective_sessions_groupIds_gin";`)
    await queryRunner.query(`
      ALTER TABLE "elective_sessions"
        ALTER COLUMN "minStudentsThreshold" SET DEFAULT 10;
    `)
    await queryRunner.query(`
      ALTER TABLE "elective_sessions"
        DROP COLUMN IF EXISTS "minSharedGroupSize",
        DROP COLUMN IF EXISTS "maxStudentsPerOffering",
        DROP COLUMN IF EXISTS "distributionMode",
        DROP COLUMN IF EXISTS "groupIds";
    `)
  }
}
