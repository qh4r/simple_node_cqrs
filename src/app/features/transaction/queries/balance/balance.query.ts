import { Query } from "../../../../../shared/query-bus";

export const BALANCE_QUERY_TYPE = "transaction/BALANCE";

export interface BalanceQueryPayload {
  ownerId: string;
}

export class BalanceQuery implements Query<BalanceQueryPayload> {
  public type: string = BALANCE_QUERY_TYPE;

  constructor(public payload: BalanceQueryPayload) {}
}
