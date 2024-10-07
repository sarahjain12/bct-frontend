import {QueryData} from "./query-data";

export class Query {
  name: string;
  data: QueryData[];

  constructor(name: string, data: QueryData[]) {
    this.name = name;
    this.data = data;
  }
}
