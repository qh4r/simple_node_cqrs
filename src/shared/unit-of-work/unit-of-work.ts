import { EntityManager, Connection } from "typeorm";

export type TransactionCallback<T> = (
  transactionManager: Pick<EntityManager, "getRepository" | "getCustomRepository">,
) => Promise<T>;

export class UnitOfWork {
  constructor(private dbConnection: Connection) {}

  async runTransaction<T>(transactionCallback: TransactionCallback<T>) {
    const queryRunner = this.dbConnection.createQueryRunner();
    await queryRunner.startTransaction();
    try {
      const transactionManager = queryRunner.manager;
      await transactionCallback(transactionManager);
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
