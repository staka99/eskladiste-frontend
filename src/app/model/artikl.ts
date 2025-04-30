import { Company } from "./company";

export class Artikl {
  id!:number;
  sifra!:string;
  naziv!:string;
  jedinica!:string;
  stanje!:number;
  cijena!:number;
  imaAktivnihStavki?: boolean;
  company?:Company;
}
