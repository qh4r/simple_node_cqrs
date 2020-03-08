import { RedisClient } from "redis";
import { Logger } from "../logger";

export type Event = {
  name: string;
  payload: any;
};

export type EventSubscribersMeta = { name: string; method: string };

export interface EventSubscriberInterface {
  getSubscribedEvents(): EventSubscribersMeta[];
}

export interface EventDispatcherInterface {
  dispatch(event: Event): Promise<void>;
}

export type Subscriber = (event: Event) => Promise<void>;

type Subscribers = { name: string; subscriber: Subscriber };

export class EventDispatcher {
  private logger: Logger;

  private subscribers: Subscribers[] = [];

  private redisPublisher: RedisClient;

  private redisSubscriber: RedisClient;

  constructor(
    logger: Logger,
    eventSubscribers: EventSubscriberInterface[] = [],
    redisPublisher: RedisClient,
    redisSubscriber: RedisClient,
  ) {
    if (eventSubscribers) {
      this.addSubscribers(eventSubscribers);
    }

    this.logger = logger;
    this.redisPublisher = redisPublisher;
    this.redisSubscriber = redisSubscriber;

    this.redisSubscriber.on("message", (channel, message) => {
      const event = JSON.parse(message);
      this.subscribers
        .filter(s => s.name === event.name)
        .map(({ subscriber }) =>
          subscriber(event).catch(e => this.logger.debug(`Subscriber failed to handle event ${event.name}`, e)),
        );
    });

    this.redisSubscriber.subscribe("event");
  }

  public addSubscribers(subscribers: EventSubscriberInterface[]) {
    subscribers.forEach(subscriber => this.addSubscriber(subscriber));
  }

  public addSubscriber(subscriber: EventSubscriberInterface) {
    if (subscriber.getSubscribedEvents().length === 0) {
      return;
    }

    const subscribers = subscriber.getSubscribedEvents().map(({ name, method }) => ({
      name,
      subscriber: (subscriber as any)[method].bind(subscriber),
    }));

    this.subscribers.push(...subscribers);
  }

  public async dispatch(event: Event) {
    this.logger.debug(`Dispatching event ${event.name}@${JSON.stringify(event.payload)}`);

    this.redisPublisher.publish("event", JSON.stringify(event));
  }
}
