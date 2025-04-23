import { Company } from "./company";

export class Transakcija {
  id!:number | null;
  datum!:Date;
  kolicina!:number | null;
  novoStanje!:number | null;
  opis!:string;
  artikl!:string;
  jedinica!:string;
  company?:Company;
}
