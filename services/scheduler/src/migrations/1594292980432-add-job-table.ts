import { MigrationInterface, QueryRunner } from "typeorm";

export class addJobTable1594292980432 implements MigrationInterface {
  name = "addJobTable1594292980432";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "Job_status_enum" AS ENUM('Completed', 'Failed', 'Delayed', 'Active', 'Waiting', 'Paused', 'Stuck', 'Deleted')`,
      undefined,
    );
    await queryRunner.query(
      `CREATE TABLE "Job" ("id" uuid NOT NULL, "name" character varying NOT NULL, "service" character varying NOT NULL, "action" character varying NOT NULL, "status" "Job_status_enum", "jobOptions" jsonb, "payload" jsonb, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_981d90e7185b9ec1ee6b814ec21" PRIMARY KEY ("id"))`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "Job"`, undefined);
    await queryRunner.query(`DROP TYPE "Job_status_enum"`, undefined);
  }
}
