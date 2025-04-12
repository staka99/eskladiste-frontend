import { Artikl } from './../model/artikl';
import { ARTIKL_URL } from './../../constants';
import { HttpClient } from "@angular/common/http";
import { Injectable } from '@angular/core';
import { Observable } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class ArtiklService {

  constructor(private httpClient: HttpClient) { }

  public getAllArtikli():Observable<any> {
    return this.httpClient.get(`${ARTIKL_URL}`);
  }

  public getOneArtikl(artiklId:number):Observable<Artikl>{
    return this.httpClient.get<Artikl>(`${ARTIKL_URL}/${artiklId}`);
  }

  public getBySifra(sifra:string):Observable<any> {
    return this.httpClient.get(`${ARTIKL_URL}/sifra/${sifra}`);
  }

  public addArtikl(artikl:Artikl):Observable<any>{
    return this.httpClient.post(`${ARTIKL_URL}`, artikl);
  }

  public updateArtikl(artikl:Artikl):Observable<any>{
    return this.httpClient.put(`${ARTIKL_URL}/${artikl.id}`, artikl);
  }

  public deleteArtikl(id:number):Observable<any>{
    return this.httpClient.delete<string>(`${ARTIKL_URL}/${id}`, {
      responseType: 'text' as 'json'
    });
  }
}
