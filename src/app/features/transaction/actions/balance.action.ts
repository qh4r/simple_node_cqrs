import { Request, Response, NextFunction } from "express";
import { celebrate, Joi } from "celebrate";
import { QueryBus } from "../../../../shared/query-bus";
import { BalanceQuery } from "../queries/balance";

export interface BalanceActionProps {
  queryBus: QueryBus;
}

export const balanceActionValidation = celebrate(
  {
    headers: Joi.object(),
  },
  { abortEarly: false },
);

const balanceAction = ({ queryBus }: BalanceActionProps) => (req: Request, res: Response, next: NextFunction) => {
  queryBus
    .execute(
      new BalanceQuery({
        ownerId: res.locals.user.id,
      }),
    )
    .then(queryResult => {
      res.json(queryResult.result);
    })
    .catch(next);
};
export default balanceAction;
