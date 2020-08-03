import { MigrationInterface, QueryRunner } from "typeorm";

export class changeJobId1596034892119 implements MigrationInterface {
  name = "changeJobId1596034892119";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "Job" ALTER COLUMN "status" SET DEFAULT 'paused'`, undefined);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "Job" ALTER COLUMN "status" SET DEFAULT 'active'`, undefined);
  }
}
