import { Command } from "../../../../shared/command-bus";

export const SIGN_UP_COMMAND_TYPE = "users/SIGNUP";

export interface SignUpCommandPayload {
  email: string;
  name: string;
  password: string;
  repeatPassword: string;
}

export class SignUpCommand implements Command<SignUpCommandPayload> {
  public type: string = SIGN_UP_COMMAND_TYPE;

  constructor(public payload: SignUpCommandPayload) {}
}
