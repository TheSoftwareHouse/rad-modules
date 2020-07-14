import { MigrationInterface, QueryRunner } from "typeorm";

export class addPolicy1569493167547 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `CREATE TABLE "Policy" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "attribute" character varying NOT NULL, "resource" character varying NOT NULL, CONSTRAINT "PK_0652e7497b74bb02cbc691edd84" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(`DROP TABLE "Policy"`);
  }
}
