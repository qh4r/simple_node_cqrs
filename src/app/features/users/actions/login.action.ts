import { Request, Response, NextFunction } from "express";
import { celebrate, Joi } from "celebrate";
import { CommandBus } from "../../../../shared/command-bus";
import { LoginCommand } from "../commands/login.command";

export interface LoginActionProps {
  commandBus: CommandBus;
}

export const loginActionValidation = celebrate(
  {
    body: Joi.object().keys({
      email: Joi.string().required(),
      password: Joi.string().required(),
    }),
  },
  { abortEarly: false },
);

const loginAction = ({ commandBus }: LoginActionProps) => (req: Request, res: Response, next: NextFunction) => {
  commandBus
    .execute(
      new LoginCommand({
        email: req.body.email,
        password: req.body.password,
      }),
    )
    .then(commandResult => {
      res.json({
        accessToken: commandResult,
      });
    })
    .catch(next);
};

export default loginAction;
