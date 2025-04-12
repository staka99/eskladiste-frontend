import { Nalog } from "./nalog";

export class Stavka {
  id!:number | null;
  nalog!:Nalog;
  sifra!:string;
  artikl!:string;
  kolicina!:number | null;
  jedinica!:string;
}
