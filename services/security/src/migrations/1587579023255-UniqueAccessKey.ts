import { MigrationInterface, QueryRunner } from "typeorm";

export class UniqueAccessKey1587579023255 implements MigrationInterface {
  name = "UniqueAccessKey1587579023255";

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(`CREATE UNIQUE INDEX "api_key_item_sequence" ON "AccessKey" ("apiKey") `, undefined);
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(`DROP INDEX "api_key_item_sequence"`, undefined);
  }
}
