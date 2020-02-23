import {MigrationInterface, QueryRunner} from "typeorm";

export class UserModel1582486970483 implements MigrationInterface {
    name = 'UserModel1582486970483'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TABLE "User" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying(50) NOT NULL, "name" character varying(50) NOT NULL, "password" character varying NOT NULL, "salt" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_9862f679340fb2388436a5ab3e4" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_4a257d2c9837248d70640b3e36" ON "User" ("email") `, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`DROP INDEX "IDX_4a257d2c9837248d70640b3e36"`, undefined);
        await queryRunner.query(`DROP TABLE "User"`, undefined);
    }

}
