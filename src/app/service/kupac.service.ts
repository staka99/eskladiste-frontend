import { Kupac } from './../model/kupac';
import { KUPAC_URL } from './../../constants';
import { HttpClient } from "@angular/common/http";
import { Injectable } from '@angular/core';
import { Observable } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class KupacService {

  constructor(private httpClient: HttpClient) { }

  public getAllKupac():Observable<any> {
    return this.httpClient.get(`${KUPAC_URL}`);
  }

  public getOneKupac(kupacId:number):Observable<Kupac>{
    return this.httpClient.get<Kupac>(`${KUPAC_URL}/${kupacId}`);
  }

  public addKupac(kupac:Kupac):Observable<any>{
    return this.httpClient.post(`${KUPAC_URL}`, kupac);
  }

  public updateKupac(kupac:Kupac):Observable<any>{
    return this.httpClient.put(`${KUPAC_URL}/${kupac.id}`, kupac);
  }

  public deleteKupac(id:number):Observable<any>{
    return this.httpClient.delete<string>(`${KUPAC_URL}/${id}`, {
      responseType: 'text' as 'json'
    });
  }
}
