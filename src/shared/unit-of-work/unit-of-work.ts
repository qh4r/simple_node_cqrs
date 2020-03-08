import { EntityManager, Connection } from "typeorm";

export type UnitOfWorkTransactionManager = Pick<EntityManager, "getRepository" | "getCustomRepository">;

export type TransactionCallback<T> = (
  transactionManager: UnitOfWorkTransactionManager,
) => Promise<T>;

export class UnitOfWork {
  constructor(private dbConnection: Connection) {}

  async runTransaction<T>(transactionCallback: TransactionCallback<T>) {
    const queryRunner = this.dbConnection.createQueryRunner();
    await queryRunner.startTransaction();
    try {
      const transactionManager = queryRunner.manager;
      const result = await transactionCallback(transactionManager);
      await queryRunner.commitTransaction();
      return result;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
