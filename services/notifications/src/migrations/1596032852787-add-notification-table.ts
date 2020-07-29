import {MigrationInterface, QueryRunner} from "typeorm";

export class addNotificationTable1596032852787 implements MigrationInterface {
    name = 'addNotificationTable1596032852787'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "Notification" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "chanel" character varying NOT NULL, "message" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_da18f6446b6fea585f01d03f56c" PRIMARY KEY ("id"))`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "Notification"`, undefined);
    }

}
