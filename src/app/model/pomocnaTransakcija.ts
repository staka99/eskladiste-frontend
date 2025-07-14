import { Artikl } from "./artikl";
import { Company } from "./company";

export class PomocnaTransakcija {
  id!:number | null;
  datum!:Date| null;
  kolicina!:number | null;
  novoStanje!:number | null;
  opis!:string;
  artikl!:Artikl;
  jedinica!:string;
  ulaz!: number | null;
  izlaz!: number | null;
  company?:Company;
}
