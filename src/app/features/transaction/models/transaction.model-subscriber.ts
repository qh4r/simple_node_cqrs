import { EntitySubscriberInterface, EventSubscriber, InsertEvent } from "typeorm";
import { BalanceViewModel } from "../../users/models/balance-view.model";
import { TransactionModel } from "./transaction.model";

@EventSubscriber()
export class PersonSubscriber implements EntitySubscriberInterface<TransactionModel> {

  listenTo() {
    return TransactionModel;
  }

  async afterInsert(event: InsertEvent<TransactionModel>) {
    await event.manager.getRepository(BalanceViewModel).query("REFRESH MATERIALIZED VIEW balance_view_model");
  }
}
