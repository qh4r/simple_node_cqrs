import { EntitySubscriberInterface, EventSubscriber, InsertEvent } from "typeorm";
import { UserModel } from "./user.model";
import { BalanceViewModel } from "./balance-view.model";

@EventSubscriber()
export class PersonSubscriber implements EntitySubscriberInterface<UserModel> {

  listenTo() {
    return UserModel;
  }

  async afterInsert(event: InsertEvent<UserModel>) {
    await event.manager.getRepository(BalanceViewModel).query("REFRESH MATERIALIZED VIEW balance_view_model");
  }
}
