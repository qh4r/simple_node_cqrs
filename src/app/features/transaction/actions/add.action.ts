import { NextFunction, Request, Response } from "express";
import { celebrate, Joi } from "celebrate";
import { ACCEPTED } from "http-status-codes";
import { CommandBus } from "../../../../shared/command-bus";
import { AddCommand } from "../commands/add.command";
import { Operation } from "../models/operation.enum";

export interface AddActionProps {
  commandBus: CommandBus;
}

export const addActionValidation = (req: Request, res: Response, next: NextFunction) => {
  return celebrate(
    {
      headers: Joi.object({
        "content-type": Joi.string()
          .regex(/application\/json/)
          .required(),
      }).unknown(),
      // TODO: require ownerId based on operation type
      body: Joi.object({
        targetId: req.body.operation === Operation.TRANSFER ? Joi.string().required() : Joi.string(),
        operation: Joi.string()
          .valid(Object.keys(Operation))
          .required(),
        amount: Joi.number()
          .min(0)
          .invalid(0),
      }),
    },
    { abortEarly: false },
  )(req, res, next);
};

/**
 * @swagger
 *
 * /api/transaction/add:
 *   post:
 *     description: desc
 *     responses:
 *       201:
 *         description: desc
 *       400:
 *         description: Validation Error
 *       500:
 *         description: Internal Server Error
 */
const addAction = ({ commandBus }: AddActionProps) => (req: Request, res: Response, next: NextFunction) => {
  commandBus
    .execute(
      new AddCommand({
        ...req.body,
        ownerId: res.locals.user.id,
      }),
    )
    .then(() => {
      res.sendStatus(ACCEPTED);
    })
    .catch(next);
};
export default addAction;
