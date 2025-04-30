import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { User } from "../model/user";
import { BACKEND_URL } from "../../constants";

@Injectable({
    providedIn: 'root'
  })
  export class UserService {

    constructor(private httpClient: HttpClient) { }

    public getAllUsers():Observable<any> {
      return this.httpClient.get(`${BACKEND_URL}/user`);
    }

    public getUserById(id:number):Observable<any> {
      return this.httpClient.get(`${BACKEND_URL}/user/${id}`);
    }

    public addUser(user:User):Observable<any>{
      console.log("Ovde: " + user.company?.name);
      return this.httpClient.post(`${BACKEND_URL}/register`, user);
    }

    public updateUser(user:User):Observable<any>{
      return this.httpClient.put(`${BACKEND_URL}/user/${user.id}`, user);
    }

    public deleteUser(id:number):Observable<any>{
      return this.httpClient.delete<string>(`${BACKEND_URL}/user/${id}`, {
        responseType: 'text' as 'json'
      });
    }
  }
