import { Company } from "./company";

export class Kupac {
  id!:number;
  naziv!:string;
  jib!:string;
  adresa!:string;
  postanskiBroj!:string;
  grad!:string;
  company?:Company;
}
