import { MigrationInterface, QueryRunner } from "typeorm";

export class accessKey1577283657694 implements MigrationInterface {
  name = "accessKey1577283657694";

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `CREATE TABLE "AccessKey" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "apiKey" character varying NOT NULL, "tokenConfiguration" text NOT NULL, CONSTRAINT "PK_1c8104b1bd0256fe44c88d9b1e2" PRIMARY KEY ("id"))`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(`DROP TABLE "AccessKey"`, undefined);
  }
}
