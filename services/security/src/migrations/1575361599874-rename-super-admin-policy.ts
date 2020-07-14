import { MigrationInterface, QueryRunner } from "typeorm";

export class renameSuperAdminPolicy1575361599874 implements MigrationInterface {
  name = "renameSuperAdminPolicy1575361599874";

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `UPDATE "Policy" SET "attribute" = 'ROLE_SUPERADMIN', "resource" = 'admin-panel/access' WHERE "attribute" = 'SuperAdmin'`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {}
}
