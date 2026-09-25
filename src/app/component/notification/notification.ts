import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { notification } from '../../interface/notification';
import { NotificationService } from '../../service/notification.service';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification.html',
  styleUrl: './notification.css'
})
export class Notification implements OnInit {

  private readonly server = 'https://localhost:8080/api/v1';

  private notificationService = inject(NotificationService);

  notifications = this.notificationService.notifications;

  ngOnInit(): void {
    this.notificationService.loadNotifications();
  }

  markAsRead(id: number): void {
  this.notificationService.markAsRead(id);
}

  trackById(index: number, notif: notification): number {
    return notif.id;
  }
}