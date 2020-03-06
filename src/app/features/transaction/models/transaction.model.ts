import { BeforeInsert, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { Operation } from "./operation.enum";
import { UserModel } from "../../users/models/user.model";

import v4 = require("uuid/v4");
import { NumericColumnTransformer } from "../../../../shared/numeric-column-transformer/numeric-column-transformer";

interface TransactionModelProps {
  operation: Operation;
  ownerId: string;
  targetId?: string;
  amount: number;
}

@Entity({
  name: "transaction",
})
export class TransactionModel {
  public static create(data: Partial<TransactionModelProps>): TransactionModel {
    const entity = new TransactionModel();
    Object.assign(entity, data);
    return entity;
  }

  @PrimaryColumn("uuid")
  id: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column("enum", { enum: Operation })
  operation: Operation;

  @ManyToOne(
    () => UserModel,
    user => user.ownedTransaction,
    { nullable: false },
  )
  @JoinColumn({ name: "ownerId" })
  owner: UserModel;

  @ManyToOne(
    () => UserModel,
    user => user.targetTransactions,
    { nullable: true },
  )
  @JoinColumn({ name: "targetId" })
  target?: UserModel;

  @Column({ name: "ownerId", nullable: true })
  ownerId?: string;

  @Column({ name: "targetId", nullable: true })
  targetId?: string;

  @Column('numeric', {
    precision: 7,
    scale: 2,
    transformer: new NumericColumnTransformer(),
  })
  amount: number;

  @BeforeInsert()
  generateId = async () => {
    this.id = this.id || v4();
  };
}
