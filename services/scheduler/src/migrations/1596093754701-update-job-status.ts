import { MigrationInterface, QueryRunner } from "typeorm";

export class updateJobStatus1596093754701 implements MigrationInterface {
  name = "updateJobStatus1596093754701";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "Job" DROP CONSTRAINT "PK_981d90e7185b9ec1ee6b814ec21"`, undefined);
    await queryRunner.query(`ALTER TABLE "Job" DROP COLUMN "id"`, undefined);
    await queryRunner.query(`ALTER TABLE "Job" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`, undefined);
    await queryRunner.query(
      `ALTER TABLE "Job" ADD CONSTRAINT "PK_981d90e7185b9ec1ee6b814ec21" PRIMARY KEY ("id")`,
      undefined,
    );
    await queryRunner.query(`ALTER TYPE "public"."Job_status_enum" RENAME TO "Job_status_enum_old"`, undefined);
    await queryRunner.query(
      `CREATE TYPE "Job_status_enum" AS ENUM('new', 'active', 'completed', 'failed', 'paused', 'deleted')`,
      undefined,
    );
    await queryRunner.query(`ALTER TABLE "Job" ALTER COLUMN "status" DROP DEFAULT`, undefined);
    await queryRunner.query(
      `ALTER TABLE "Job" ALTER COLUMN "status" TYPE "Job_status_enum" USING "status"::"text"::"Job_status_enum"`,
      undefined,
    );
    await queryRunner.query(`ALTER TABLE "Job" ALTER COLUMN "status" SET DEFAULT 'new'`, undefined);
    await queryRunner.query(`DROP TYPE "Job_status_enum_old"`, undefined);
    await queryRunner.query(`ALTER TABLE "Job" ALTER COLUMN "status" SET DEFAULT 'new'`, undefined);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "Job" ALTER COLUMN "status" SET DEFAULT 'paused'`, undefined);
    await queryRunner.query(
      `CREATE TYPE "Job_status_enum_old" AS ENUM('completed', 'failed', 'active', 'paused', 'deleted')`,
      undefined,
    );
    await queryRunner.query(`ALTER TABLE "Job" ALTER COLUMN "status" DROP DEFAULT`, undefined);
    await queryRunner.query(
      `ALTER TABLE "Job" ALTER COLUMN "status" TYPE "Job_status_enum_old" USING "status"::"text"::"Job_status_enum_old"`,
      undefined,
    );
    await queryRunner.query(`ALTER TABLE "Job" ALTER COLUMN "status" SET DEFAULT 'new'`, undefined);
    await queryRunner.query(`DROP TYPE "Job_status_enum"`, undefined);
    await queryRunner.query(`ALTER TYPE "Job_status_enum_old" RENAME TO  "Job_status_enum"`, undefined);
    await queryRunner.query(`ALTER TABLE "Job" DROP CONSTRAINT "PK_981d90e7185b9ec1ee6b814ec21"`, undefined);
    await queryRunner.query(`ALTER TABLE "Job" DROP COLUMN "id"`, undefined);
    await queryRunner.query(`ALTER TABLE "Job" ADD "id" SERIAL NOT NULL`, undefined);
    await queryRunner.query(
      `ALTER TABLE "Job" ADD CONSTRAINT "PK_981d90e7185b9ec1ee6b814ec21" PRIMARY KEY ("id")`,
      undefined,
    );
  }
}
