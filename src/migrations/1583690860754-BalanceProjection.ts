import {MigrationInterface, QueryRunner} from "typeorm";

export class BalanceProjection1583690860754 implements MigrationInterface {
    name = 'BalanceProjection1583690860754'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TABLE "balance_projection" ("id" uuid NOT NULL, "email" character varying NOT NULL, "name" character varying NOT NULL, "balance" numeric(7,2) NOT NULL, CONSTRAINT "PK_d279cea2e8670d17b845b8c8730" PRIMARY KEY ("id"))`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`DROP TABLE "balance_projection"`, undefined);
    }

}
