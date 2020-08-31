import { MigrationInterface, QueryRunner } from "typeorm";

export class updateJobModel1597229801874 implements MigrationInterface {
  name = "updateJobModel1597229801874";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "Job" DROP COLUMN "service"`, undefined);
    await queryRunner.query(`ALTER TABLE "Job" DROP COLUMN "action"`, undefined);
    await queryRunner.query(`ALTER TABLE "Job" ADD "type" character varying NOT NULL`, undefined);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "Job" DROP COLUMN "type"`, undefined);
    await queryRunner.query(`ALTER TABLE "Job" ADD "action" character varying NOT NULL`, undefined);
    await queryRunner.query(`ALTER TABLE "Job" ADD "service" character varying NOT NULL`, undefined);
  }
}
