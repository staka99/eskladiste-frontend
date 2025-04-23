import { Company } from './company';
import { Kupac } from './kupac';
export class Nalog {
  id!:number | null;
  broj!:string;
  datum!:Date;
  kupac!:Kupac | null;
  zavrsen!: boolean;
  company?:Company;
}
