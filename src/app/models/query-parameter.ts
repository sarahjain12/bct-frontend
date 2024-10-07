import {QueryData} from "./query-data";

export class QueryParameter {
  name: string;
  data: QueryData[];

  constructor(name: string, data: QueryData[]) {
    this.name = name;
    this.data = data;
  }
}
