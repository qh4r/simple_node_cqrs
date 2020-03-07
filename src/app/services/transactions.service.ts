import { Repository } from "typeorm";
import { BAD_REQUEST } from "http-status-codes";
import { TransactionModel } from "../features/transaction/models/transaction.model";
import { Operation } from "../features/transaction/models/operation.enum";
import { NotFoundError } from "../../errors/not-found.error";
import { HttpError } from "../../errors/http.error";
import { BalanceViewModel } from "../features/users/models/balance-view.model";

export interface TransactionsServiceProps {
  transactionRepository: Repository<TransactionModel>;
  balanceViewRepository: Repository<BalanceViewModel>;
}

export interface HandleOperationProps {
  targetId?: string;
  ownerId: string;
  operation: Operation;
  amount: number;
}

export class TransactionsService {
  constructor(private dependencies: TransactionsServiceProps) {}

  async handleOperation({ amount, operation, ownerId, targetId }: HandleOperationProps): Promise<number> {
    switch (operation) {
      case Operation.TRANSFER:
        return this.handleTransfer(ownerId, targetId!, amount);
      case Operation.DEPOSIT:
        return this.handleDeposit(ownerId, amount);
      case Operation.WITHDRAW:
        return this.handleWithdraw(ownerId, amount);
      default:
        throw new NotFoundError("error.unknown.operation");
    }
  }

  async getBalance(ownerId: string): Promise<number> {
    const balanceView = await this.dependencies.balanceViewRepository.findOne({
      where: {
        id: ownerId,
      },
    });

    return balanceView ? balanceView!.balance : 0;
  }

  private async handleTransfer(ownerId: string, targetId: string, amount: number): Promise<number> {
    const balance = await this.getBalance(ownerId);

    if (amount > balance) {
      throw new HttpError("error.notEnoughFounds", BAD_REQUEST);
    }

    await this.dependencies.transactionRepository.save(
      TransactionModel.create({
        amount,
        targetId,
        ownerId,
        operation: Operation.TRANSFER,
      }),
    );

    return balance - amount;
  }

  private async handleDeposit(ownerId: string, amount: number): Promise<number> {
    const balance = await this.getBalance(ownerId);

    await this.dependencies.transactionRepository.save(
      TransactionModel.create({
        amount,
        ownerId,
        operation: Operation.DEPOSIT,
      }),
    );

    return balance + amount;
  }

  private async handleWithdraw(ownerId: string, amount: number): Promise<number> {
    const balance = await this.getBalance(ownerId);

    if (amount > balance) {
      throw new HttpError("error.notEnoughFounds", BAD_REQUEST);
    }

    await this.dependencies.transactionRepository.save(
      TransactionModel.create({
        amount,
        ownerId,
        operation: Operation.WITHDRAW,
      }),
    );

    return balance - amount;
  }
}
