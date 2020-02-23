import { CommandHandler } from "../../../../shared/command-bus";
import { LOGIN_COMMAND_TYPE, LoginCommand } from "../commands/login.command";
import { AuthenticationService } from "../../../services/authentication.service";
import { EventDispatcher } from "../../../../shared/event-dispatcher";

export interface LoginHandlerProps {
  authenticationService: AuthenticationService;
  eventDispatcher: EventDispatcher;
}

export default class LoginHandler implements CommandHandler<LoginCommand> {
  public commandType: string = LOGIN_COMMAND_TYPE;

  private readonly authenticationService: AuthenticationService;

  private readonly eventDispatcher: EventDispatcher;

  constructor({authenticationService, eventDispatcher}: LoginHandlerProps) {
    this.authenticationService = authenticationService;
    this.eventDispatcher = eventDispatcher;
  }

  async execute(command: LoginCommand) {
    await this.eventDispatcher.dispatch({
      name: "UserLoggedIn",
      payload: command,
    });

    return this.authenticationService.login(command.payload);
  }
}
