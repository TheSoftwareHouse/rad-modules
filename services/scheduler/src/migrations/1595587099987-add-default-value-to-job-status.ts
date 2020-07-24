import { MigrationInterface, QueryRunner } from "typeorm";

export class addDefaultValueToJobStatus1595587099987 implements MigrationInterface {
  name = "addDefaultValueToJobStatus1595587099987";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`UPDATE "Job" SET "status" = 'Active' WHERE "status" IS NULL`);
    await queryRunner.query(`ALTER TABLE "Job" ALTER COLUMN "status" SET DEFAULT 'Active'`);
    await queryRunner.query(`ALTER TABLE "Job" ALTER COLUMN "status" SET NOT NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "Job" ALTER COLUMN "status" DROP NOT NULL`);
    await queryRunner.query(`ALTER TABLE "Job" ALTER COLUMN "status" DROP DEFAULT`);
  }
}
