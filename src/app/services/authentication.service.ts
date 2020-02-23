import { BAD_REQUEST, FORBIDDEN, UNAUTHORIZED } from "http-status-codes";
import { HttpError } from "../../errors/http.error";
import { Secret, sign, SignOptions, TokenExpiredError, verify } from "jsonwebtoken";
import { promisify } from "util";
import { Repository } from "typeorm";
import { UserModel } from "../features/users/models/user.model";
import { randomBytes, pbkdf2 } from "crypto";
import { validate } from "email-validator";

export interface AuthenticationServiceProps {
  usersRepository: Repository<UserModel>;
  accessTokenKey: string;
}

export interface TokenPayload {
  userId: string;
  name: string;
}

export interface RegisterUserProps {
  email: string;
  name: string;
  password: string;
  repeatPassword: string;
}

export interface LoginUserProps {
  email: string;
  password: string;
}

const asyncSign = (
  payload: string | Buffer | object,
  secretOrPrivateKey: Secret,
  options?: SignOptions,
): Promise<string> =>
  new Promise((resolve, reject) => {
    sign(payload, secretOrPrivateKey, options || {}, (error: Error, encoded: string) => {
      if (error) {
        reject(error);
      }

      return resolve(encoded);
    });
  });

const asyncVerify = promisify(verify);

const asyncPbkdf2 = promisify(pbkdf2);

export class AuthenticationService {
  private readonly usersRepository: Repository<UserModel>;

  private readonly accessTokenKey: string;

  constructor({ usersRepository, accessTokenKey }: AuthenticationServiceProps) {
    this.usersRepository = usersRepository;
    this.accessTokenKey = accessTokenKey;
  }

  async verifyToken(token: string): Promise<UserModel> {
    try {
      const decodedAccessToken: any = await asyncVerify(token, this.accessTokenKey);

      return this.getUserFromTokenPayload(decodedAccessToken);
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new HttpError("error.token.expired", UNAUTHORIZED);
      }
    }

    throw new HttpError("error.token.temperedWith", BAD_REQUEST);
  }

  async register(props: RegisterUserProps): Promise<string> {
    if(!validate(props.email)) {
      throw new HttpError("error.email.wrongFormat", BAD_REQUEST);
    }
    if(props.password && (props.password.length < 8)) {
      throw new HttpError("error.password.tooShort", BAD_REQUEST);
    }
    if (props.password !== props.repeatPassword) {
      throw new HttpError("error.password.notMatching", BAD_REQUEST);
    }

    const salt = this.generateSalt();
    const hashedPassword = await this.hashPassword(props.password, salt);

    const user = UserModel.create({
      email: props.email,
      name: props.name,
      password: hashedPassword,
      salt: salt,
    });

    try {
      const savedUser = await this.usersRepository.save(user);
      return this.generateToken(savedUser.id, savedUser.name);
    } catch (e) {
      throw new HttpError("error.user.emailAlreadyInUse", BAD_REQUEST);
    }
  }

  async login(props: LoginUserProps) {
    const user = await this.usersRepository.findOne({
      where: {
        email: props.email,
      },
    });

    if (user && await this.validatePassword(props.password, user)) {
      return this.generateToken(user.id, user.name);
    }

    throw new HttpError("error.user.wrongNameOrPassword", FORBIDDEN);
  }

  private async generateToken(userId: string, name: string): Promise<string> {
    const tokenPayload: TokenPayload = {
      userId,
      name,
    };

    return asyncSign(tokenPayload, this.accessTokenKey);
  }

  private generateSalt(): string {
    return randomBytes(16).toString("hex");
  }

  private async hashPassword(password: string, salt: string) {
    return (
      await asyncPbkdf2(password, salt, 1000, 64, `sha512`)
    ).toString(`hex`);
  }

  private async validatePassword(password: string, user: UserModel): Promise<boolean> {
    const hashedAttempt = await this.hashPassword(password, user.salt);
    return hashedAttempt === user.password;
  }

  private async getUserFromTokenPayload(decodedVerifyToken: TokenPayload): Promise<UserModel> {
    if (decodedVerifyToken.userId) {
      const user = await this.usersRepository.findOne({
        where: { id: decodedVerifyToken.userId },
      });

      if (user) {
        return user;
      }
    }

    throw new HttpError("error.token.temperedWith", BAD_REQUEST);
  }
}
