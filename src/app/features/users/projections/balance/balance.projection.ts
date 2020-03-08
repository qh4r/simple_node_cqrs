import { Column, Entity, PrimaryColumn } from "typeorm";
import { NumericColumnTransformer } from "../../../../../shared/numeric-column-transformer/numeric-column-transformer";

interface BalanceProjectionModelProps {
  id: string;
  email: string;
  name: string;
  balance: number;
}

@Entity({
  name: "balance_projection",
})
export class BalanceProjection {
  public static create(data: Partial<BalanceProjectionModelProps>): BalanceProjection {
    const entity = new BalanceProjection();
    Object.assign(entity, data);
    return entity;
  }

  @PrimaryColumn("uuid")
  id: string;

  @Column()
  email: string;

  @Column()
  name: string;

  @Column("numeric", {
    precision: 7,
    scale: 2,
    transformer: new NumericColumnTransformer(),
  })
  balance: number;
}
