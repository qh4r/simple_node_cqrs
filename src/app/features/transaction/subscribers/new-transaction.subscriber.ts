import { Event, EventSubscriberInterface, EventSubscribersMeta } from "../../../../shared/event-dispatcher";
import { BalanceProjector } from "../../users/projections/balance/balance.projector";

type NewTransactionEventSubscriberProps = {
  balanceProjector: BalanceProjector;
};

export const NEW_TRANSACTION_EVENT_NAME = "NewTransaction";

export default class NewTransactionEventSubscriber implements EventSubscriberInterface {
  public constructor(private dependencies: NewTransactionEventSubscriberProps) {}

  getSubscribedEvents(): EventSubscribersMeta[] {
    return [{ name: NEW_TRANSACTION_EVENT_NAME, method: "newTransaction" }];
  }

  async newTransaction(event: Event) {
    return this.dependencies.balanceProjector.updateBalance(event.payload);
  }
}
