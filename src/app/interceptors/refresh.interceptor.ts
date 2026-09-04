// refresh.interceptor.ts
import { HttpInterceptorFn, HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';

export const RefreshInterceptor: HttpInterceptorFn = (req, next) => {
  const http = inject(HttpClient);

  return next(req).pipe(
    catchError(err => {
      if (err.status === 401) {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          return http.post<any>('http://localhost:8080/api/v1/auth/refresh', { refreshToken })
            .pipe(
              switchMap(res => {
                localStorage.setItem('accessToken', res.accessToken);
                const cloned = req.clone({ setHeaders: { Authorization: `Bearer ${res.accessToken}` } });
                return next(cloned);
              })
            );
        }
      }
      return throwError(() => err);
    })
  );
};
