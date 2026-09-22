import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { notification } from '../interface/notification';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly server = 'http://localhost:8080/api/v1';

  http = inject(HttpClient);

  getNotifications(): Observable<notification[]> {
    return this.http.get<notification[]>(`${this.server}/notifications`);
  }
}
