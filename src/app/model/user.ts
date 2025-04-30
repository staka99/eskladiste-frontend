import { Company } from "./company";

export class User {
  id!:number;
  username!:string;
  password!:string;
  role!:string;
  company!:Company;
}
