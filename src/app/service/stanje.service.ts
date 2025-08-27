import { BACKEND_URL } from './../../constants';
import { HttpClient } from "@angular/common/http";
import { Injectable } from '@angular/core';
import { Observable } from "rxjs";
import { Stanje } from '../model/stanje';

@Injectable({
  providedIn: 'root'
})
export class StanjeService {

  constructor(private httpClient: HttpClient) { }

  public getAllStanja():Observable<any> {
    return this.httpClient.get(`${BACKEND_URL}/stanje`);
  }

  public getOneStanje(stanjeId:number):Observable<Stanje>{
    return this.httpClient.get<Stanje>(`${BACKEND_URL}/stanje/${stanjeId}`);
  }

  public addStanje(stanje:Stanje):Observable<any>{
    return this.httpClient.post(`${BACKEND_URL}/stanje`, stanje);
  }

  public updateStanje(stanje:Stanje):Observable<any>{
    return this.httpClient.put(`${BACKEND_URL}/stanje/${stanje.id}`, stanje);
  }

  public deleteStanje(id:number):Observable<any>{
    return this.httpClient.delete<string>(`${BACKEND_URL}/stanje/${id}`, {
      responseType: 'text' as 'json'
    });
  }

  public getStanjaByCompany(id:number):Observable<any> {
    return this.httpClient.get(`${BACKEND_URL}/stanje-company/${id}`);
  }

}
