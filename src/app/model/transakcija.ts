import { Artikl } from "./artikl";

export class Transakcija {
  id!:number | null;
  datum!:Date;
  kolicina!:number | null;
  opis!:string;
  artikl!:Artikl;
}
