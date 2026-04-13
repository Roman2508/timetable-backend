import { MigrationInterface, QueryRunner } from 'typeorm'

export class GroupCurator1790200000000 implements MigrationInterface {
  name = 'GroupCurator1790200000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "groups"
      ADD COLUMN IF NOT EXISTS "curatorId" integer NULL;
    `)

    await queryRunner.query(`
      ALTER TABLE "groups"
      ADD CONSTRAINT "FK_groups_curatorId"
      FOREIGN KEY ("curatorId") REFERENCES "teacher"("id") ON DELETE SET NULL;
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "groups" DROP CONSTRAINT IF EXISTS "FK_groups_curatorId";`)
    await queryRunner.query(`ALTER TABLE "groups" DROP COLUMN IF EXISTS "curatorId";`)
  }
}
