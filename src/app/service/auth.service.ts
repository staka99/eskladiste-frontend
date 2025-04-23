import { BACKEND_URL } from './../../constants';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient) { }

  login(username: string, password: string): Observable<any> {
    return this.http.post<any>(`${BACKEND_URL}/login`, { username, password })
      .pipe(
        catchError(error => {
          throw error;
        })
      );
  }

  isAdmin(): boolean {
    return localStorage.getItem('role') === 'ADMIN';
  }

  isUser(): boolean {
    return localStorage.getItem('role') === 'USER';
  }
}
