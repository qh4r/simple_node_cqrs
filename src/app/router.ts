import * as express from "express";

export interface RoutingProps {
  usersRouting: express.Router;
  transactionRouting: express.Router;
  // ROUTES_INTERFACE
}

export const createRouter = ({
  usersRouting,
  transactionRouting,
  // ROUTES_DEPENDENCIES
}: RoutingProps) => {
  const router = express.Router();

  router.use("/users", usersRouting);
  router.use("/transaction", transactionRouting);
  // ROUTES_CONFIG
  return router;
};
