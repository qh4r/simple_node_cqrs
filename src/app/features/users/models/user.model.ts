import {
  Column,
  Entity,
  Index,
  CreateDateColumn,
  PrimaryColumn,
  BeforeInsert,
  OneToMany,
  BeforeUpdate,
  AfterInsert, AfterUpdate, getRepository,
} from "typeorm";
import { TransactionModel } from "../../transaction/models/transaction.model";

import v4 = require("uuid/v4");
import { BalanceViewModel } from "./balance-view.model";

interface UserModelProps {
  email: string;
  name: string;
  password: string;
  salt: string;
  ownedRaffles: string;
  giverPairs: string;
  receiverPairs: string;
}

@Entity({
  name: "User",
})
export class UserModel {
  public static create(data: Partial<UserModelProps>): UserModel {
    const entity = new UserModel();
    Object.assign(entity, data);
    return entity;
  }

  @PrimaryColumn("uuid")
  id: string;

  @Column({ length: 50 })
  @Index({ unique: true })
  email: string;

  @Column({ length: 50 })
  name: string;

  @Column()
  password: string;

  @Column()
  salt: string;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(
    () => TransactionModel,
    transaction => transaction.owner,
  )
  ownedTransaction: TransactionModel[];

  @OneToMany(
    () => TransactionModel,
    transaction => transaction.target,
  )
  targetTransactions: TransactionModel[];

  @BeforeInsert()
  generateId = async () => {
    this.id = this.id || v4();
  };

  @BeforeInsert()
  @BeforeUpdate()
  lowercaseEmail = async () => {
    this.email = this.email.toLowerCase();
  };

  @AfterInsert()
  @AfterUpdate()
  async updateBalanceView() {
    await getRepository(BalanceViewModel).query("REFRESH MATERIALIZED VIEW balance_view_model");
  }
}
