import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { notification } from '../interface/notification';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly server = 'https://localhost:8080/api/v1';

  http = inject(HttpClient);

  notifications = signal<notification[]>([]);

  notificationCount = computed(
    () => this.notifications().length
  )

  loadNotifications(): void {
    this.http.get<notification[]>(`${this.server}/notifications`).subscribe({
      next: (data) => {
        this.notifications.set(data);
      },
      error: (err) => {
        console.error('Failed to load Notifications', err);
      }
    })
  }

  markAsRead(id: number) {
    this.http.patch(`${this.server}/notifications/${id}/read`, {})
    .subscribe({
      next: () => {
        this.notifications.update(list => 
          list.filter(n => n.id !== id)
        );
      },
      error: (err) => {
        console.error('Failed to mark notification as read', err);
      }
    })
  }
}
