import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit, signal } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Avatar } from 'primeng/avatar';
import { Button } from 'primeng/button';
import { PopoverModule } from 'primeng/popover'
import { filter } from 'rxjs/operators';
import { notification } from '../../interface/notification';
import { NotificationService } from '../../service/notification.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  templateUrl: './admin.html',
  styleUrls: ['./admin.css'],
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    Avatar,
    Button,
    PopoverModule
  ]
})
export class Admin implements OnInit {
  breadcrumbs: { label: string, url: string }[] = [];
  notifications: notification[] = [];
  notificationCount = 0;
  private readonly server: string = 'http://localhost:8080/api/v1';

  constructor(private router: Router, 
              private route: ActivatedRoute, 
              private http: HttpClient,
              private notificationService: NotificationService,
              private cd: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.buildBreadcrumbs();
    this.setupBreadcrumbs();
    this.loadNotifications();
  }

  private setupBreadcrumbs(): void {
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe(() => {
        this.buildBreadcrumbs();
        this.loadNotifications();
        this.cd.detectChanges();
      });
  }

  private buildBreadcrumbs(): void {
    const crumbs: { label: string, url: string }[] = [];
    let currentRoute = this.route.root;
    let url = '/admin';

    while (currentRoute.firstChild) {
      currentRoute = currentRoute.firstChild;
      if (currentRoute.snapshot.url.length) {
        url += '/' + currentRoute.snapshot.url.map((segment: any) => segment.path).join('/');
        crumbs.push({
          label: currentRoute.snapshot.data['breadcrumb'] || currentRoute.snapshot.url[0].path,
          url: '/admin' + url
        });
      }
    }

    this.breadcrumbs = crumbs;
  }

  private loadNotifications(): void {
    this.notificationService.getNotifications().subscribe({
      next: (data) => {
        this.notifications = data;
        this.notificationCount = data.length;
        this.cd.detectChanges();
      },
      error: (err) => {console.error('Failed to load Notification', err)}
    });
  }

  markAsRead(id: number): void {
    this.http.patch(`${this.server}/notifications/${id}/read`, {})
      .subscribe({
        next: () => {
          this.notifications = this.notifications.filter(n => n.id !== id);
          this.notificationCount = this.notifications.length;
          this.cd.detectChanges(); 
        },
        error: (err) => console.error(`Failed to mark notification ${id} as read`, err)
      });
  }

  trackById(index: number, notif: notification): number {
    return notif.id;
  }


  logout(): void {
    const refreshToken = localStorage.getItem('refreshToken');
    if(refreshToken) {
      this.http.post(`${this.server}/auth/logout`, {refreshToken})
        .subscribe({
          next: () => {
            this.clearTokensAndRedirect();
          },
          error: () => {
            this.clearTokensAndRedirect();
          } 
        });
    } else {
      this.clearTokensAndRedirect();
    }
  }

  clearTokensAndRedirect(): void {
    localStorage.removeItem('jwt');
    localStorage.removeItem('refreshToken');
    this.router.navigate(['/login']);
  }
}
