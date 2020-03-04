import * as express from "express";

import { addActionValidation } from "./actions/add.action";
import { balanceActionValidation } from "./actions/balance.action";
import { MiddlewareType } from "../../../shared/middleware-type/middleware.type";
// VALIDATION_IMPORTS

export interface TransactionRoutingProps {
  addAction: express.RequestHandler;
  balanceAction: express.RequestHandler;
  authenticationMiddleware: MiddlewareType;
  // ACTIONS_IMPORTS
}

export const transactionRouting = (props: TransactionRoutingProps) => {
  const router = express.Router();

  router.use(props.authenticationMiddleware);

  router.post("/add", [addActionValidation], props.addAction);
  router.get("/balance", [balanceActionValidation], props.balanceAction);
  // ACTIONS_SETUP

  return router;
};
