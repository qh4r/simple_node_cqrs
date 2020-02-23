import { CommandHandler } from "../../../../shared/command-bus";
import { SIGN_UP_COMMAND_TYPE, SignUpCommand } from "../commands/sign-up.command";
import { AuthenticationService } from "../../../services/authentication.service";

export interface SignUpCommandHandlerProps {
  authenticationService: AuthenticationService;
}

export default class SignUpCommandHandler implements CommandHandler<SignUpCommand> {
  public commandType: string = SIGN_UP_COMMAND_TYPE;

  private readonly authenticationService: AuthenticationService;

  constructor({authenticationService}: SignUpCommandHandlerProps) {
    this.authenticationService = authenticationService;
  }


  async execute(command: SignUpCommand) {
    return this.authenticationService.register(command.payload);
  };
}
