import { Repository } from "typeorm";
import { BAD_REQUEST } from "http-status-codes";
import { TransactionModel } from "../features/transaction/models/transaction.model";
import { Operation } from "../features/transaction/models/operation.enum";
import { NotFoundError } from "../../errors/not-found.error";
import { HttpError } from "../../errors/http.error";
import { UnitOfWork, UnitOfWorkTransactionManager } from "../../shared/unit-of-work/unit-of-work";
import { BalanceViewRepository } from "../repositories/balance-view.repository";
import { UserModel } from "../features/users/models/user.model";

export interface TransactionsServiceProps {
  transactionRepository: Repository<TransactionModel>;
  balanceViewRepository: BalanceViewRepository;
  unitOfWork: UnitOfWork;
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

  async getBalance(ownerId: string) {
    return this.dependencies.balanceViewRepository.findOneOrFail({
      where: {
        id: ownerId,
      },
    });
  }

  private async handleTransfer(ownerId: string, targetId: string, amount: number): Promise<void> {
    return this.dependencies.unitOfWork.runTransaction(async transactionManager => {
      await this.ensureUserExists(targetId, transactionManager);
      await this.ensureHasFounds(ownerId, amount, transactionManager);

      await transactionManager.getRepository(TransactionModel).save(
        TransactionModel.create({
          amount,
          targetId,
          ownerId,
          operation: Operation.TRANSFER,
        }),
      );

      await transactionManager.getCustomRepository(BalanceViewRepository).refreshBalanceView();
    });
  }

  private async handleDeposit(ownerId: string, amount: number): Promise<void> {
    return this.dependencies.unitOfWork.runTransaction(async transactionManager => {
      await transactionManager.getRepository(TransactionModel).save(
        TransactionModel.create({
          amount,
          ownerId,
          operation: Operation.DEPOSIT,
        }),
      );

      await transactionManager.getCustomRepository(BalanceViewRepository).refreshBalanceView();
    });
  }

  private async handleWithdraw(ownerId: string, amount: number): Promise<void> {
    return this.dependencies.unitOfWork.runTransaction(async transactionManager => {
      await this.ensureHasFounds(ownerId, amount, transactionManager);

      await transactionManager.getRepository(TransactionModel).save(
        TransactionModel.create({
          amount,
          ownerId,
          operation: Operation.WITHDRAW,
        }),
      );

      await transactionManager.getCustomRepository(BalanceViewRepository).refreshBalanceView();
    });
  }

  private async ensureHasFounds(ownerId: string, amount: number, transactionManager: UnitOfWorkTransactionManager) {
    const balance = await transactionManager.getCustomRepository(BalanceViewRepository).getBalanceValueById(ownerId);

    if (amount > balance) {
      throw new HttpError("error.notEnoughFounds", BAD_REQUEST);
    }
  }

  private async ensureUserExists(targetId: string, transactionManager: UnitOfWorkTransactionManager) {
    const targetUser = await transactionManager.getRepository(UserModel).findOne({
      where: {
        id: targetId,
      },
    });

    if (!targetUser) {
      throw new NotFoundError("error.transfer.target.notFound");
    }
  }

}
