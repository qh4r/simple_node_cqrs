import { QueryHandler } from "../../../../shared/query-bus";
import { BALANCE_QUERY_TYPE, BalanceQuery, BalanceQueryResult } from "../queries/balance";
import { TransactionsService } from "../../../services/transactions.service";

export interface BalanceQueryHandlerProps {
  transactionsService: TransactionsService;
}

export default class BalanceQueryHandler implements QueryHandler<BalanceQuery, BalanceQueryResult> {
  public queryType: string = BALANCE_QUERY_TYPE;

  constructor(private dependencies: BalanceQueryHandlerProps) {}

  async execute(query: BalanceQuery): Promise<BalanceQueryResult> {
    const balance = await this.dependencies.transactionsService.getUserBalanceInfo(query.payload.ownerId);
    // do something with the query and transform it to result.
    return new BalanceQueryResult(balance);
  }
}
