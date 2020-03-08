import * as awilix from "awilix";
import { AwilixContainer, Lifetime, Resolver } from "awilix";
import { Application } from "express";
import * as http from "http";
import { createConnection, ConnectionOptions } from "typeorm";
import { createApp } from "./app/app";
import { createRouter } from "./app/router";
import { errorHandler } from "./middleware/error-handler";
import { CommandBus } from "./shared/command-bus";
import { winstonLogger } from "./shared/logger";
import { QueryBus } from "./shared/query-bus";
import { EventDispatcher, EventSubscriberInterface } from "./shared/event-dispatcher";
import { TransactionModel } from "./app/features/transaction/models/transaction.model";
// MODELS_IMPORTS

import { usersRouting } from "./app/features/users/routing";
import { transactionRouting } from "./app/features/transaction/routing";
// ROUTING_IMPORTS

import LoginCommandHandler from "./app/features/users/handlers/login.handler";
import AddCommandHandler from "./app/features/transaction/handlers/add.handler";
import BalanceQueryHandler from "./app/features/transaction/query-handlers/balance.query.handler";
// HANDLERS_IMPORTS

import EmailEventSubscriber from "./app/features/users/subscribers/email.subscriber";
import NewTransactionEventSubscriber from "./app/features/transaction/subscribers/new-transaction.subscriber";
import NewUserEventSubscriber from "./app/features/users/subscribers/new-user.subscriber";
// SUBSCRIBERS_IMPORTS

import { cacheClient } from "./tools/cache-client";
import * as db from "../config/db";
import * as config from "../config/services";
import * as redisConfig from "../config/redis";
import SignUpCommandHandler from "./app/features/users/handlers/sign-up.handler";
import { AuthenticationService } from "./app/services/authentication.service";
import { UserModel } from "./app/features/users/models/user.model";
import { authenticationMiddlewareFactory } from "./middleware/authentication.middleware";
import { TransactionsService } from "./app/services/transactions.service";
import { BalanceProjectionRepository } from "./app/repositories/balance-projection.repository";
import { UnitOfWork } from "./shared/unit-of-work/unit-of-work";
import { BalanceProjector } from "./app/features/users/projections/balance/balance.projector";
import { connectRedisClient } from "./shared/connect-redis-client/connect-redis-client";


function asArray<T>(resolvers: Resolver<T>[]): Resolver<T[]> {
  return {
    resolve: (container: AwilixContainer) => resolvers.map((r: Resolver<T>) => container.build(r))
  };
}

export async function createContainer(): Promise<AwilixContainer> {
  const container: AwilixContainer = awilix.createContainer({
    injectionMode: awilix.InjectionMode.PROXY,
  });

  container.register({
    cacheClient: awilix.asValue(cacheClient)
  });

  const dbConnection = await createConnection(db as ConnectionOptions);
  await dbConnection.runMigrations();

  const redisPublisher = await connectRedisClient(redisConfig);
  const redisSubscriber = await connectRedisClient(redisConfig);

  container.register({
    port: awilix.asValue(config.port),
    logger: awilix.asValue(winstonLogger),
    accessTokenKey: awilix.asValue(config.accessTokenKey),
    dbConnection: awilix.asValue(dbConnection),
    redisPublisher: awilix.asValue(redisPublisher),
    redisSubscriber: awilix.asValue(redisSubscriber),
  });

  container.loadModules([ 
    "src/**/*.action.ts",
    "src/**/*.action.js"
  ], {
    formatName: "camelCase",
    resolverOptions: {
      lifetime: Lifetime.SCOPED,
      register: awilix.asFunction,
    },
  });

  container.register({
    authenticationMiddleware: awilix.asFunction(authenticationMiddlewareFactory),
    usersRouting: awilix.asFunction(usersRouting),
    transactionRouting: awilix.asFunction(transactionRouting),
  // ROUTING_SETUP
  });

  container.register({
    unitOfWork: awilix.asClass(UnitOfWork).classic(),
    errorHandler: awilix.asFunction(errorHandler),
    router: awilix.asFunction(createRouter),
    queryBus: awilix.asClass(QueryBus).classic().singleton(),
    eventSubscribers: asArray([
      awilix.asClass(EmailEventSubscriber),
      awilix.asClass(NewTransactionEventSubscriber),
      awilix.asClass(NewUserEventSubscriber),
      // SUBSCRIBERS_SETUP
    ] as Resolver<EventSubscriberInterface>[]),
    eventDispatcher: awilix.asClass(EventDispatcher).classic().singleton(),
    commandHandlers: asArray([
      awilix.asClass(LoginCommandHandler),
      awilix.asClass(SignUpCommandHandler),
      awilix.asClass(AddCommandHandler),
      // COMMAND_HANDLERS_SETUP
    ] as Resolver<any>[]),
    commandBus: awilix.asClass(CommandBus).classic().singleton(),
    queryHandlers: asArray([
      awilix.asClass(BalanceQueryHandler),
      // QUERY_HANDLERS_SETUP
    ]),
    usersRepository: awilix.asValue(dbConnection.getRepository(UserModel)),
    transactionRepository: awilix.asValue(dbConnection.getRepository(TransactionModel)),
    balanceProjectionRepository: awilix.asValue(dbConnection.getCustomRepository(BalanceProjectionRepository)),
    balanceProjector: awilix.asClass(BalanceProjector),
    // MODELS_SETUP
  });

  container.register({
    authenticationService: awilix.asClass(AuthenticationService),
    transactionsService: awilix.asClass(TransactionsService),
  });

  container.register({
    app: awilix.asFunction(createApp).singleton(),
  });

  const app: Application = container.resolve("app");

  container.register({
    server: awilix.asValue(http.createServer(app)),
  });

  return container;
}
