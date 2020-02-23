import * as express from "express";

import { loginActionValidation } from "./actions/login.action";
import { signUpActionValidation } from "./actions/sign-up.action";
// VALIDATION_IMPORTS

export interface UsersRoutingProps {
  loginAction: express.RequestHandler;
  signUpAction: express.RequestHandler;
  // ACTIONS_IMPORTS
}

export const usersRouting = (actions: UsersRoutingProps) => {
  const router = express.Router();

  router.post("/login", [loginActionValidation], actions.loginAction);
  router.post("/sign-up", [signUpActionValidation], actions.signUpAction);
  // ACTIONS_SETUP

  return router;
};
