import { Artikl } from "./artikl";
import { Nalog } from "./nalog";

export class PomocnaStavka {
  id!:number | null;
  nalog!:Nalog;
  artikl!:Artikl;
  kolicina!:number | null;
  jedinica!:string;
}
