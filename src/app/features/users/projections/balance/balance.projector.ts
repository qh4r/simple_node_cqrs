import { Repository } from "typeorm";
import { BalanceProjectionRepository } from "../../../../repositories/balance-projection.repository";
import { UnitOfWork, UnitOfWorkEntityManager } from "../../../../../shared/unit-of-work/unit-of-work";
import { Operation } from "../../../transaction/models/operation.enum";
import { UserModel } from "../../models/user.model";
import { BalanceProjection } from "./balance.projection";
import { NotFoundError } from "../../../../../errors/not-found.error";

export interface BalanceProjectorProps {
  unitOfWork: UnitOfWork;
  balanceProjectionRepository: Repository<BalanceProjection>;
}

export interface UpdateBalanceProps {
  targetId?: string;
  ownerId: string;
  operation: Operation;
  amount: number;
}

export class BalanceProjector {
  constructor(private dependencies: BalanceProjectorProps) {}

  async updateBalance(props: UpdateBalanceProps, manager?: UnitOfWorkEntityManager) {
    if (manager) {
      return this.processTransaction(props, manager);
    }
    return this.dependencies.unitOfWork.runTransaction(async transactionManager => {
      return this.processTransaction(props, transactionManager);
    });
  }

  async createNewUserProjection({ id, name, email }: UserModel, manager?: UnitOfWorkEntityManager) {
    const usersRepository = manager ? manager.getRepository(BalanceProjection) : this.dependencies.balanceProjectionRepository;
    await usersRepository.save(
      BalanceProjection.create({
        id,
        email,
        name,
        balance: 0,
      }),
    );
  }

  private async processTransaction(
    { amount, operation, ownerId, targetId }: UpdateBalanceProps,
    manager: UnitOfWorkEntityManager,
  ) {
    switch (operation) {
      case Operation.TRANSFER:
        await this.addFounds(targetId!, amount, manager);
        return this.subtractFounds(ownerId, amount, manager);
      case Operation.DEPOSIT:
        return this.addFounds(ownerId, amount, manager);
      case Operation.WITHDRAW:
        return this.subtractFounds(ownerId, amount, manager);
      default:
        throw new NotFoundError("error.unknown.operation");
    }
  }

  private async addFounds(userId: string, amount: number, manager: UnitOfWorkEntityManager) {
    return this.getUpdateQueryBuilder(userId, manager)
      .set({
        balance: () => `balance + ${amount}`,
      })
      .execute();
  }

  private async subtractFounds(userId: string, amount: number, manager: UnitOfWorkEntityManager) {
    return this.getUpdateQueryBuilder(userId, manager)
      .set({
        balance: () => `balance - ${amount}`,
      })
      .execute();
  }

  private getUpdateQueryBuilder(userId: string, manager: UnitOfWorkEntityManager) {
    return manager
      .getCustomRepository(BalanceProjectionRepository)
      .createQueryBuilder("bp")
      .update(BalanceProjection)
      .where("id=:userId", {
        userId,
      });
  }
}
