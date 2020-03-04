import { QueryResult } from "../../../../../shared/query-bus";

export class BalanceQueryResult implements QueryResult<any> {
  constructor(public result: number) {}
}
