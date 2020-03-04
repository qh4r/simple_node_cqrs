import { Command } from "../../../../shared/command-bus";
import { HandleOperationProps } from "../../../services/transactions.service";

export const ADD_COMMAND_TYPE = "transaction/ADD";

export type AddCommandPayload = HandleOperationProps;

export class AddCommand implements Command<AddCommandPayload> {
  public type: string = ADD_COMMAND_TYPE;

  constructor(public payload: AddCommandPayload) {}
}
