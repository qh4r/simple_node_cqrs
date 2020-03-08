import { Event, EventSubscriberInterface, EventSubscribersMeta } from "../../../../shared/event-dispatcher";
import { BalanceProjector } from "../projections/balance/balance.projector";

type NewUserEventSubscriberProps = {
  balanceProjector: BalanceProjector;
};

export const NEW_USER_EVENT_NAME = "NewUser";

export default class NewUserEventSubscriber implements EventSubscriberInterface {
  public constructor(private dependencies: NewUserEventSubscriberProps) {}

  getSubscribedEvents(): EventSubscribersMeta[] {
    return [{ name: NEW_USER_EVENT_NAME, method: "newUser" }];
  }

  async newUser(event: Event) {
    return this.dependencies.balanceProjector.createNewUserProjection(event.payload);
  }
}
