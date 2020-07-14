import { MigrationInterface, QueryRunner } from "typeorm";

export class addUser1568627627963 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `CREATE TABLE "User" ("id" SERIAL NOT NULL, "username" character varying NOT NULL, "password" character varying NOT NULL, "passwordSalt" character varying NOT NULL, CONSTRAINT "PK_9862f679340fb2388436a5ab3e4" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(`DROP TABLE "User"`);
  }
}
