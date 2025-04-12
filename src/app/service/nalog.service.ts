import { NALOG_URL } from './../../constants';
import { HttpClient } from "@angular/common/http";
import { Injectable } from '@angular/core';
import { map, Observable } from "rxjs";
import { Nalog } from '../model/nalog';

@Injectable({
  providedIn: 'root'
})
export class NalogService {

  constructor(private httpClient: HttpClient) { }

  public getAllNalozi():Observable<any> {
    return this.httpClient.get(`${NALOG_URL}`);
  }
  getNaloziUizradi(): Observable<Nalog[]> {
    return this.httpClient.get<Nalog[]>(`${NALOG_URL}`).pipe(
      map(nalozi => nalozi.filter(n => !n.zavrsen))
    );
  }

  getZavrseniNalozi(): Observable<Nalog[]> {
    return this.httpClient.get<Nalog[]>(`${NALOG_URL}`).pipe(
      map(nalozi => nalozi.filter(n => n.zavrsen))
    );
  }

  public getOneNalog(nalogId:number):Observable<Nalog>{
    return this.httpClient.get<Nalog>(`${NALOG_URL}/${nalogId}`);
  }

  public addNalog(nalog:Nalog):Observable<any>{
    return this.httpClient.post(`${NALOG_URL}`, nalog);
  }

  public updateNalog(nalog:Nalog):Observable<any>{
    return this.httpClient.put(`${NALOG_URL}/${nalog.id}`, nalog);
  }

  public deleteNalog(id:number):Observable<any>{
    return this.httpClient.delete<string>(`${NALOG_URL}/${id}`, {
      responseType: 'text' as 'json'
    });
  }
}
