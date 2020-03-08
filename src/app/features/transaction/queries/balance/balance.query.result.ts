import { QueryResult } from "../../../../../shared/query-bus";
import { BalanceProjection } from "../../../users/projections/balance/balance.projection";

export class BalanceQueryResult implements QueryResult<any> {
  constructor(public result: BalanceProjection) {}
}
