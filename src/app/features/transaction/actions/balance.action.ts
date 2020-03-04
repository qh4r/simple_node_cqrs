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

/**
 * @swagger
 *
 * /api/transaction/balance:
 *   get:
 *     description: desc
 *     responses:
 *       201:
 *         description: desc
 *       400:
 *         description: Validation Error
 *       500:
 *         description: Internal Server Error
 */
const balanceAction = ({ queryBus }: BalanceActionProps) => (req: Request, res: Response, next: NextFunction) => {
  queryBus
    .execute(
      new BalanceQuery({
        ownerId: res.locals.user.id,
      }),
    )
    .then(queryResult => {
      res.json({
        balance: queryResult.result,
      });
    })
    .catch(next);
};
export default balanceAction;
