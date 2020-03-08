import { EntityRepository, Repository } from "typeorm";
import { BalanceViewModel } from "../features/users/models/balance-view.model";

@EntityRepository(BalanceViewModel)
export class BalanceViewRepository extends Repository<BalanceViewModel> {
  async getBalanceValueById(ownerId: string): Promise<number> {
    const balance = await this.findOne({
      where: {
        id: ownerId,
      },
    });

    return balance ? balance.balance : 0;
  }

  async refreshBalanceView() {
    await this.query("REFRESH MATERIALIZED VIEW balance_view_model");
  }
}
