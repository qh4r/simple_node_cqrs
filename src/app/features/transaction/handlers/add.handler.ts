import { CommandHandler } from "../../../../shared/command-bus";
import { ADD_COMMAND_TYPE, AddCommand } from "../commands/add.command";
import { TransactionsService } from "../../../services/transactions.service";

export interface AddHandlerProps {
  transactionsService: TransactionsService;
}

export default class AddHandler implements CommandHandler<AddCommand> {
  public commandType: string = ADD_COMMAND_TYPE;

  constructor(private dependencies: AddHandlerProps) {}

  async execute(command: AddCommand) {
    const newBalance = await this.dependencies.transactionsService.handleOperation(command.payload);

    return {
      result: newBalance,
    };
  }
}
