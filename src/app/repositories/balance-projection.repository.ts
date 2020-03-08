import { EntityRepository, Repository } from "typeorm";
import { BalanceProjection } from "../features/users/projections/balance/balance.projection";

@EntityRepository(BalanceProjection)
export class BalanceProjectionRepository extends Repository<BalanceProjection> {
  async getBalanceValueById(ownerId: string): Promise<number> {
    const balance = await this.findOne({
      where: {
        id: ownerId,
      },
    });

    return balance ? balance.balance : 0;
  }
}
