import { MigrationInterface, QueryRunner } from "typeorm";

export class refactorAccessKey1578639739977 implements MigrationInterface {
  name = "refactorAccessKey1578639739977";

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(`ALTER TABLE "AccessKey" DROP COLUMN "accessExpirationInSeconds"`, undefined);
    await queryRunner.query(`ALTER TABLE "AccessKey" DROP COLUMN "refreshExpirationInSeconds"`, undefined);
    await queryRunner.query(`ALTER TABLE "AccessKey" DROP COLUMN "attributes"`, undefined);
    await queryRunner.query(`ALTER TABLE "AccessKey" DROP COLUMN "policy"`, undefined);
    await queryRunner.query(`ALTER TABLE "AccessKey" ADD "createdBy" character varying NOT NULL`, undefined);
    await queryRunner.query(`ALTER TABLE "AccessKey" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`, undefined);
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(`ALTER TABLE "AccessKey" DROP COLUMN "createdAt"`, undefined);
    await queryRunner.query(`ALTER TABLE "AccessKey" DROP COLUMN "createdBy"`, undefined);
    await queryRunner.query(`ALTER TABLE "AccessKey" ADD "policy" text array NOT NULL`, undefined);
    await queryRunner.query(`ALTER TABLE "AccessKey" ADD "attributes" text array NOT NULL`, undefined);
    await queryRunner.query(`ALTER TABLE "AccessKey" ADD "refreshExpirationInSeconds" integer NOT NULL`, undefined);
    await queryRunner.query(`ALTER TABLE "AccessKey" ADD "accessExpirationInSeconds" integer NOT NULL`, undefined);
  }
}
