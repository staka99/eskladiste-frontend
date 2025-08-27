import { Company } from "./company";

export class Stanje {
  id!:number | null;
  datum!:Date;
  stanje!:number | null;
  company?:Company;
}
