import { ViewColumn, ViewEntity, Column } from "typeorm";
import { NumericColumnTransformer } from "../../../../shared/numeric-column-transformer/numeric-column-transformer";

@ViewEntity({
  expression: `
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
    `,
})
export class BalanceViewModel {
  @ViewColumn()
  id: string;

  @ViewColumn()
  email: string;

  @ViewColumn()
  name: string;

  @ViewColumn()
  @Column("numeric", {
    precision: 7,
    scale: 2,
    transformer: new NumericColumnTransformer(),
  })
  balance: number;
}
