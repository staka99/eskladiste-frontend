import { BACKEND_URL } from './../../constants';
import { HttpClient } from "@angular/common/http";
import { Injectable } from '@angular/core';
import { Observable } from "rxjs";
import { Company } from '../model/company';

@Injectable({
  providedIn: 'root'
})
export class CompanyService {

  constructor(private httpClient: HttpClient) { }

  public getAllKompanije():Observable<any> {
    return this.httpClient.get(`${BACKEND_URL}/company`);
  }

  public getOneKompanija(kompanijaId:number):Observable<Company>{
    return this.httpClient.get<Company>(`${BACKEND_URL}/company/${kompanijaId}`);
  }

  public addKompanija(kompanija:Company):Observable<any>{
    return this.httpClient.post(`${BACKEND_URL}/company`, kompanija);
  }

  public updateKompanija(kompanija:Company):Observable<any>{
    return this.httpClient.put(`${BACKEND_URL}/company/${kompanija.id}`, kompanija);
  }

  public deleteKompanija(id:number):Observable<any>{
    return this.httpClient.delete<string>(`${BACKEND_URL}/company/${id}`, {
      responseType: 'text' as 'json'
    });
  }

}
