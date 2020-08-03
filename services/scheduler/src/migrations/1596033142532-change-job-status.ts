import { MigrationInterface, QueryRunner } from "typeorm";

export class changeJobStatus1596033142532 implements MigrationInterface {
  name = "changeJobStatus1596033142532";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TYPE "public"."Job_status_enum" RENAME TO "Job_status_enum_old"`, undefined);
    await queryRunner.query(
      `CREATE TYPE "Job_status_enum" AS ENUM('completed', 'failed', 'active', 'paused', 'deleted')`,
      undefined,
    );
    await queryRunner.query(`ALTER TABLE "Job" ALTER COLUMN "status" DROP DEFAULT`, undefined);
    await queryRunner.query(
      `ALTER TABLE "Job" ALTER COLUMN "status" TYPE "Job_status_enum" USING "status"::"text"::"Job_status_enum"`,
      undefined,
    );
    await queryRunner.query(`ALTER TABLE "Job" ALTER COLUMN "status" SET DEFAULT 'active'`, undefined);
    await queryRunner.query(`DROP TYPE "Job_status_enum_old"`, undefined);
    await queryRunner.query(`ALTER TABLE "Job" ALTER COLUMN "status" SET DEFAULT 'active'`, undefined);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "Job" ALTER COLUMN "status" SET DEFAULT 'Active'`, undefined);
    await queryRunner.query(
      `CREATE TYPE "Job_status_enum_old" AS ENUM('Completed', 'Failed', 'Delayed', 'Active', 'Waiting', 'Paused', 'Stuck', 'Deleted')`,
      undefined,
    );
    await queryRunner.query(`ALTER TABLE "Job" ALTER COLUMN "status" DROP DEFAULT`, undefined);
    await queryRunner.query(
      `ALTER TABLE "Job" ALTER COLUMN "status" TYPE "Job_status_enum_old" USING "status"::"text"::"Job_status_enum_old"`,
      undefined,
    );
    await queryRunner.query(`ALTER TABLE "Job" ALTER COLUMN "status" SET DEFAULT 'active'`, undefined);
    await queryRunner.query(`DROP TYPE "Job_status_enum"`, undefined);
    await queryRunner.query(`ALTER TYPE "Job_status_enum_old" RENAME TO  "Job_status_enum"`, undefined);
  }
}
