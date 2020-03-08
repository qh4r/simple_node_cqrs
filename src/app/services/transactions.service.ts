import { Repository } from "typeorm";
import { BAD_REQUEST } from "http-status-codes";
import { TransactionModel } from "../features/transaction/models/transaction.model";
import { Operation } from "../features/transaction/models/operation.enum";
import { NotFoundError } from "../../errors/not-found.error";
import { HttpError } from "../../errors/http.error";
import { UserModel } from "../features/users/models/user.model";

export interface TransactionsServiceProps {
  transactionRepository: Repository<TransactionModel>;
  usersRepository: Repository<UserModel>;
}

export interface HandleOperationProps {
  targetId?: string;
  ownerId: string;
  operation: Operation;
  amount: number;
}

export class TransactionsService {
  constructor(private dependencies: TransactionsServiceProps) {}

  async handleOperation({ amount, operation, ownerId, targetId }: HandleOperationProps): Promise<void> {
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
    const transactions = await this.dependencies.transactionRepository
      .createQueryBuilder("transaction")
      .where('transaction."ownerId"=:ownerId OR transaction."targetId"=:ownerId', {
        ownerId,
      })
      .orderBy("transaction.createdAt", "ASC")
      .getMany();

    return transactions.reduce((balance: number, transaction: TransactionModel): number => {
      switch (transaction.operation) {
        case Operation.TRANSFER:
          if (transaction.ownerId === ownerId) {
            return balance - transaction.amount;
          }
          return balance + transaction.amount;

        case Operation.DEPOSIT:
          return balance + transaction.amount;
        case Operation.WITHDRAW:
          return balance - transaction.amount;
        default:
          return balance;
      }
    }, 0);
  }

  private async handleTransfer(ownerId: string, targetId: string, amount: number): Promise<void> {
    await this.ensureUserExists(targetId);
    await this.ensureHasFounds(ownerId, amount);

    await this.dependencies.transactionRepository.save(
      TransactionModel.create({
        amount,
        targetId,
        ownerId,
        operation: Operation.TRANSFER,
      }),
    );
  }

  private async handleDeposit(ownerId: string, amount: number): Promise<void> {
    await this.dependencies.transactionRepository.save(
      TransactionModel.create({
        amount,
        ownerId,
        operation: Operation.DEPOSIT,
      }),
    );
  }

  private async handleWithdraw(ownerId: string, amount: number): Promise<void> {
    await this.ensureHasFounds(ownerId, amount);

    await this.dependencies.transactionRepository.save(
      TransactionModel.create({
        amount,
        ownerId,
        operation: Operation.WITHDRAW,
      }),
    );
  }

  private async ensureHasFounds(ownerId: string, amount: number) {
    const balance = await this.getBalance(ownerId);

    if (amount > balance) {
      throw new HttpError("error.notEnoughFounds", BAD_REQUEST);
    }
  }

  private async ensureUserExists(targetId: string) {
    const targetUser = await this.dependencies.usersRepository.findOne({
      where: {
        id: targetId,
      },
    });

    if (!targetUser) {
      throw new NotFoundError("error.transfer.target.notFound");
    }
  }
}
