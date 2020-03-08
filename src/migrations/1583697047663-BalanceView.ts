import {MigrationInterface, QueryRunner} from "typeorm";

export class BalanceView1583697047663 implements MigrationInterface {
    name = 'BalanceView1583697047663'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE VIEW "balance_view_model" AS 
      SELECT temp.id, temp.email, temp.name,  SUM( CASE
               WHEN temp.operation::text = 'DEPOSIT' THEN temp.amount
               WHEN temp.operation::text = 'WITHDRAW' THEN temp.amount * -1
               WHEN temp.operation::text = 'TRANSFER' AND temp."ownerId"=temp.id THEN temp.amount * -1
               ELSE temp.amount
            END
          ) AS balance
          from (select u.id, u.email, u.name, t.operation, t."ownerId", t."targetId", t.amount  from "User" as u left join transaction as t on u.id =  t."ownerId" 
          union all select u.id, u.email, u.name, t.operation, t."ownerId", t."targetId", t.amount from "User" as u left join transaction as t on u.id =  t."targetId") as temp
          where temp.id is not null
          group by temp.id, temp.email, temp.name;
    `, undefined);
        await queryRunner.query(`INSERT INTO "typeorm_metadata"("type", "schema", "name", "value") VALUES ($1, $2, $3, $4)`, ["VIEW","public","balance_view_model","SELECT temp.id, temp.email, temp.name,  SUM( CASE\n               WHEN temp.operation::text = 'DEPOSIT' THEN temp.amount\n               WHEN temp.operation::text = 'WITHDRAW' THEN temp.amount * -1\n               WHEN temp.operation::text = 'TRANSFER' AND temp.\"ownerId\"=temp.id THEN temp.amount * -1\n               ELSE temp.amount\n            END\n          ) AS balance\n          from (select u.id, u.email, u.name, t.operation, t.\"ownerId\", t.\"targetId\", t.amount  from \"User\" as u left join transaction as t on u.id =  t.\"ownerId\" \n          union all select u.id, u.email, u.name, t.operation, t.\"ownerId\", t.\"targetId\", t.amount from \"User\" as u left join transaction as t on u.id =  t.\"targetId\") as temp\n          where temp.id is not null\n          group by temp.id, temp.email, temp.name;"]);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`DELETE FROM "typeorm_metadata" WHERE "type" = 'VIEW' AND "schema" = $1 AND "name" = $2`, ["public","balance_view_model"]);
        await queryRunner.query(`DROP VIEW "balance_view_model"`, undefined);
    }

}
