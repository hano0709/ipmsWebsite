import { HttpClient, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { User } from '../interface/user';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly server: string = 'http://localhost:8080/api/v1';

  constructor(private http: HttpClient) { }

  login(email: string, password: string): Observable<any> {
    return this.http.post<User>( 
      `${this.server}/auth/login`, { email, password }
    ).pipe(
        tap(user => {
          localStorage.setItem('jwt', user.accessToken);
          localStorage.setItem('refreshToken', user.refreshToken);
        }),
        catchError(this.handleError)
      );
  }

  private handleError(errorResponse: HttpErrorResponse): Observable<never> {
    let errorMessage: string;
    if (errorResponse.error instanceof ErrorEvent) {
      errorMessage = `A client error occured -${errorResponse.error.message}`;
    } else {
      if (errorResponse.error.reason) {
        errorMessage = errorResponse.error.reason;
      } else {
        errorMessage = `Server error - Error Status ${errorResponse.status}`;
      }
    }

    return throwError(() => errorMessage);
  }

  getCurrentUser() {
    const token = localStorage.getItem('jwt');
    if (!token) return null;

    const payload = JSON.parse(atob(token.split('.')[1]));
    return { role: payload.role, username: payload.sub };
  }
}
