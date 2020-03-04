import { NextFunction, Request, Response } from "express";
import { FORBIDDEN, INTERNAL_SERVER_ERROR } from "http-status-codes";
import { Repository } from "typeorm";
import { UserModel } from "../app/features/users/models/user.model";
import { HttpError } from "../errors/http.error";
import { AuthenticationService } from "../app/services/authentication.service";
import { MiddlewareType } from "../shared/middleware-type/middleware.type";

const AUTH_HEADER_FORMAT = "X-Auth-Token";

export interface AuthenticationMiddlewareProps {
  authenticationService: AuthenticationService;
  usersRepository: Repository<UserModel>;
}

export const authenticationMiddlewareFactory = ({
  authenticationService,
  usersRepository,
}: AuthenticationMiddlewareProps): MiddlewareType => async (
  req: Request,
  res: Response,
  // eslint-disable-next-line
  next: NextFunction,
) => {
  try {
    const tokenString = req.header(AUTH_HEADER_FORMAT) || "";
    const token = tokenString.split(" ")[1];

    if (token) {
      const tokenUser = await authenticationService.verifyToken(token);
      const user = await usersRepository
        .createQueryBuilder("user")
        .where("user.id=:userId", {
          userId: tokenUser.id,
        })
        .getOne();

      if (!user) {
        return next(new HttpError("error.user.not.found", INTERNAL_SERVER_ERROR));
      }

      // eslint-disable-next-line
      res.locals.user = user;
      return next();
    }
    return next(new HttpError("error.authorizationRequired", FORBIDDEN));
  } catch (err) {
    return next(err);
  }
};
