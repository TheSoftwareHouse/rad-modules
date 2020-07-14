import { MigrationInterface, QueryRunner } from "typeorm";

export class userUuid1568982424986 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(`ALTER TABLE "User" DROP CONSTRAINT "PK_9862f679340fb2388436a5ab3e4"`);
    await queryRunner.query(`ALTER TABLE "User" DROP COLUMN "id"`);
    await queryRunner.query(`ALTER TABLE "User" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`);
    await queryRunner.query(`ALTER TABLE "User" ADD CONSTRAINT "PK_9862f679340fb2388436a5ab3e4" PRIMARY KEY ("id")`);
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(`ALTER TABLE "User" DROP CONSTRAINT "PK_9862f679340fb2388436a5ab3e4"`);
    await queryRunner.query(`ALTER TABLE "User" DROP COLUMN "id"`);
    await queryRunner.query(`ALTER TABLE "User" ADD "id" SERIAL NOT NULL`);
    await queryRunner.query(`ALTER TABLE "User" ADD CONSTRAINT "PK_9862f679340fb2388436a5ab3e4" PRIMARY KEY ("id")`);
  }
}
