import { QueryResult } from "../../../../../shared/query-bus";
import { BalanceViewModel } from "../../../users/models/balance-view.model";

export class BalanceQueryResult implements QueryResult<any> {
  constructor(public result: BalanceViewModel) {}
}
