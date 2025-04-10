import { Artikl } from "./artikl";

export class PomocnaTransakcija {
  id!:number | null;
  datum!:Date;
  kolicina!:number | null;
  novoStanje!:number | null;
  opis!:string;
  artikl!:Artikl;
  jedinica!:string;
}
