import { Nalog } from "./nalog";

export class Stavka {
  id!:number | null;
  nalog!:Nalog;
  artikl!:string;
  kolicina!:number | null;
  jedinica!:string;
}
