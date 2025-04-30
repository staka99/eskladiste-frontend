import { Artikl } from "./artikl";
import { Nalog } from "./nalog";

export class PomocnaStavka {
  id!:number | null;
  nalog!:Nalog;
  artikl!:Artikl;
  kolicina!:number | null;
  cijena!:number | null;
  jedinica!:string;
}
