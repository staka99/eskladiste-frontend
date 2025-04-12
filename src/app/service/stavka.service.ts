import { STAVKA_URL, STAVKE_NALOGA_URL } from './../../constants';
import { HttpClient } from "@angular/common/http";
import { Injectable } from '@angular/core';
import { Observable } from "rxjs";
import { Stavka } from '../model/stavka';

@Injectable({
  providedIn: 'root'
})
export class StavkaService {

  constructor(private httpClient: HttpClient) { }

  public getAllStavke():Observable<any> {
    return this.httpClient.get(`${STAVKA_URL}`);
  }

  public getOneStavka(stavkaId:number):Observable<Stavka>{
    return this.httpClient.get<Stavka>(`${STAVKA_URL}/${stavkaId}`);
  }

  public getBySifra(sifra:string):Observable<any> {
    return this.httpClient.get(`${STAVKA_URL}/sifra/${sifra}`);
  }

  public addStavka(stavka:Stavka):Observable<any>{
    return this.httpClient.post(`${STAVKA_URL}`, stavka);
  }

  public updateStavka(stavka:Stavka):Observable<any>{
    return this.httpClient.put(`${STAVKA_URL}/${stavka.id}`, stavka);
  }

  public deleteStavka(id:number):Observable<any>{
    return this.httpClient.delete<string>(`${STAVKA_URL}/${id}`, {
      responseType: 'text' as 'json'
    });
  }

  public getStavkeZaNalog(nalogId:number):Observable<any>{
    return this.httpClient.get(`${STAVKE_NALOGA_URL}/${nalogId}`);
  }
}
