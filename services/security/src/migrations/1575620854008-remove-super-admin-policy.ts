import { MigrationInterface, QueryRunner } from "typeorm";

export class removeSuperAdminPolicy1575620854008 implements MigrationInterface {
  name = "removeSuperAdminPolicy1575620854008";

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `DELETE  FROM "Policy" WHERE "attribute" = 'ROLE_SUPERADMIN' AND "resource" = 'admin-panel/access'`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {}
}
