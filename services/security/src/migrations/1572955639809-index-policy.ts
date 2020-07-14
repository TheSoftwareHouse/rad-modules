import { MigrationInterface, QueryRunner } from "typeorm";

export class indexPolicy1572955639809 implements MigrationInterface {
  name = "indexPolicy1572955639809";

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `CREATE UNIQUE INDEX "index_item_sequence" ON "Policy" ("resource", "attribute") `,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(`DROP INDEX "index_item_sequence"`, undefined);
  }
}
