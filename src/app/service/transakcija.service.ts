import { Transakcija } from './../model/transakcija';
import { TRANSAKCIJA_URL } from './../../constants';
import { HttpClient } from "@angular/common/http";
import { Injectable } from '@angular/core';
import { Observable } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class TransakcijaService {

  constructor(private httpClient: HttpClient) { }

  public getAllTransakcija():Observable<any> {
    return this.httpClient.get(`${TRANSAKCIJA_URL}`);
  }

  public getOneTransakcija(transakcijaId:number):Observable<Transakcija>{
    return this.httpClient.get<Transakcija>(`${TRANSAKCIJA_URL}/${transakcijaId}`);
  }

  public addTransakcija(transakcija:Transakcija):Observable<any>{
    return this.httpClient.post(`${TRANSAKCIJA_URL}`, transakcija);
  }

  public updateTransakcija(transakcija:Transakcija):Observable<any>{
    return this.httpClient.put(`${TRANSAKCIJA_URL}/${transakcija.id}`, transakcija);
  }

  public deleteTransakcija(id:number):Observable<any>{
    return this.httpClient.delete<string>(`${TRANSAKCIJA_URL}/${id}`, {
      responseType: 'text' as 'json'
    });
  }
}
