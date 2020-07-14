import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserAttribute1569244262026 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `CREATE TABLE "Attribute" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "userId" uuid, CONSTRAINT "PK_1bad8ed08e50a6d7cc4e8a82254" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "Attribute" ADD CONSTRAINT "FK_d256f31dc87071bd32e6b68b8f9" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(`ALTER TABLE "Attribute" DROP CONSTRAINT "FK_d256f31dc87071bd32e6b68b8f9"`);
    await queryRunner.query(`DROP TABLE "Attribute"`);
  }
}
