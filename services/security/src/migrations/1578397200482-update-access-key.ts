import { MigrationInterface, QueryRunner } from "typeorm";

export class updateAccessKey1578397200482 implements MigrationInterface {
  name = "updateAccessKey1578397200482";

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(`ALTER TABLE "AccessKey" DROP COLUMN "tokenConfiguration"`, undefined);
    await queryRunner.query(`ALTER TABLE "AccessKey" ADD "type" character varying NOT NULL`, undefined);
    await queryRunner.query(`ALTER TABLE "AccessKey" ADD "accessExpirationInSeconds" integer NOT NULL`, undefined);
    await queryRunner.query(`ALTER TABLE "AccessKey" ADD "refreshExpirationInSeconds" integer NOT NULL`, undefined);
    await queryRunner.query(`ALTER TABLE "AccessKey" ADD "attributes" text array NOT NULL`, undefined);
    await queryRunner.query(`ALTER TABLE "AccessKey" ADD "policy" text array NOT NULL`, undefined);
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(`ALTER TABLE "AccessKey" DROP COLUMN "policy"`, undefined);
    await queryRunner.query(`ALTER TABLE "AccessKey" DROP COLUMN "attributes"`, undefined);
    await queryRunner.query(`ALTER TABLE "AccessKey" DROP COLUMN "refreshExpirationInSeconds"`, undefined);
    await queryRunner.query(`ALTER TABLE "AccessKey" DROP COLUMN "accessExpirationInSeconds"`, undefined);
    await queryRunner.query(`ALTER TABLE "AccessKey" DROP COLUMN "type"`, undefined);
    await queryRunner.query(`ALTER TABLE "AccessKey" ADD "tokenConfiguration" text NOT NULL`, undefined);
  }
}
