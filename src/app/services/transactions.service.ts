import { Repository } from "typeorm";
import { BAD_REQUEST } from "http-status-codes";
import { TransactionModel } from "../features/transaction/models/transaction.model";
import { Operation } from "../features/transaction/models/operation.enum";
import { NotFoundError } from "../../errors/not-found.error";
import { HttpError } from "../../errors/http.error";
import { UnitOfWork, UnitOfWorkEntityManager } from "../../shared/unit-of-work/unit-of-work";
import { BalanceProjectionRepository } from "../repositories/balance-projection.repository";
import { UserModel } from "../features/users/models/user.model";
import { EventDispatcherInterface } from "../../shared/event-dispatcher";
import { NEW_TRANSACTION_EVENT_NAME } from "../features/transaction/subscribers/new-transaction.subscriber";

export interface TransactionsServiceProps {
  transactionRepository: Repository<TransactionModel>;
  balanceProjectionRepository: BalanceProjectionRepository;
  unitOfWork: UnitOfWork;
  eventDispatcher: EventDispatcherInterface;
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
    return this.dependencies.balanceProjectionRepository.findOneOrFail(ownerId);
  }

  private async handleTransfer(ownerId: string, targetId: string, amount: number): Promise<void> {
    return this.dependencies.unitOfWork.runTransaction(async transactionManager => {
      await this.ensureHasFounds(ownerId, amount, transactionManager);
      await this.ensureUserExists(targetId, transactionManager);

      await transactionManager.getRepository(TransactionModel).save(
        TransactionModel.create({
          amount,
          targetId,
          ownerId,
          operation: Operation.TRANSFER,
        }),
      );

      await this.dependencies.eventDispatcher.dispatch({
        name: NEW_TRANSACTION_EVENT_NAME,
        payload: {
          ownerId,
          targetId,
          amount,
          operation: Operation.TRANSFER,
        },
      });
    });
  }

  private async handleDeposit(ownerId: string, amount: number): Promise<void> {
    await this.dependencies.transactionRepository.save(
      TransactionModel.create({
        amount,
        ownerId,
        operation: Operation.DEPOSIT,
      }),
    );

    await this.dependencies.eventDispatcher.dispatch({
      name: NEW_TRANSACTION_EVENT_NAME,
      payload: {
        ownerId,
        amount,
        operation: Operation.DEPOSIT,
      },
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

      await this.dependencies.eventDispatcher.dispatch({
        name: NEW_TRANSACTION_EVENT_NAME,
        payload: {
          ownerId,
          amount,
          operation: Operation.WITHDRAW,
        },
      });
    });
  }

  private async ensureHasFounds(ownerId: string, amount: number, transactionManager: UnitOfWorkEntityManager) {
    const balance = await transactionManager
      .getCustomRepository(BalanceProjectionRepository)
      .getBalanceValueById(ownerId);

    if (amount > balance) {
      throw new HttpError("error.notEnoughFounds", BAD_REQUEST);
    }
  }

  private async ensureUserExists(targetId: string, transactionManager: UnitOfWorkEntityManager) {
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
