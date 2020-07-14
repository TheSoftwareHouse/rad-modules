import { MigrationInterface, QueryRunner } from "typeorm";

export class addSuperAdminPolicy1575283124886 implements MigrationInterface {
  name = "addSuperAdminPolicy1575283124886";

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `INSERT INTO "Policy" ("attribute", "resource") VALUES ('SuperAdmin','SuperAdmin')`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {}
}
