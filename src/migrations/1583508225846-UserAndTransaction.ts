import {MigrationInterface, QueryRunner} from "typeorm";

export class UserAndTransaction1583508225846 implements MigrationInterface {
    name = 'UserAndTransaction1583508225846'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TABLE "User" ("id" uuid NOT NULL, "email" character varying(50) NOT NULL, "name" character varying(50) NOT NULL, "password" character varying NOT NULL, "salt" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_9862f679340fb2388436a5ab3e4" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_4a257d2c9837248d70640b3e36" ON "User" ("email") `, undefined);
        await queryRunner.query(`CREATE TYPE "transaction_operation_enum" AS ENUM('DEPOSIT', 'WITHDRAW', 'TRANSFER')`, undefined);
        await queryRunner.query(`CREATE TABLE "transaction" ("id" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "operation" "transaction_operation_enum" NOT NULL, "ownerId" uuid, "targetId" uuid, "amount" numeric(7,2) NOT NULL, CONSTRAINT "PK_89eadb93a89810556e1cbcd6ab9" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`ALTER TABLE "transaction" ADD CONSTRAINT "FK_4c8758c388632a5cc0dde24060a" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "transaction" ADD CONSTRAINT "FK_13d6b6fa2bac2269b0caf790f46" FOREIGN KEY ("targetId") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "transaction" DROP CONSTRAINT "FK_13d6b6fa2bac2269b0caf790f46"`, undefined);
        await queryRunner.query(`ALTER TABLE "transaction" DROP CONSTRAINT "FK_4c8758c388632a5cc0dde24060a"`, undefined);
        await queryRunner.query(`DROP TABLE "transaction"`, undefined);
        await queryRunner.query(`DROP TYPE "transaction_operation_enum"`, undefined);
        await queryRunner.query(`DROP INDEX "IDX_4a257d2c9837248d70640b3e36"`, undefined);
        await queryRunner.query(`DROP TABLE "User"`, undefined);
    }

}
