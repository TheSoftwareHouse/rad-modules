import { MigrationInterface, QueryRunner } from "typeorm";

export class setJobNameUnique1596440671965 implements MigrationInterface {
  name = "setJobNameUnique1596440671965";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "Job" ADD CONSTRAINT "UQ_bc4b0e2914b6a6d94ec1ffd82bb" UNIQUE ("name")`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "Job" DROP CONSTRAINT "UQ_bc4b0e2914b6a6d94ec1ffd82bb"`, undefined);
  }
}
