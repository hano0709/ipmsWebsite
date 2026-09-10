import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, signal } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Avatar } from 'primeng/avatar';
import { Button } from 'primeng/button';
import { filter } from 'rxjs/operators';

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
    Button
  ]
})
export class Admin implements OnInit {
  breadcrumbs: { label: string, url: string }[] = [];

  notificationCount = 3;
  private readonly server: string = 'http://localhost:8080/api/v1';

  constructor(private router: Router, private route: ActivatedRoute, private http: HttpClient) {}

  ngOnInit(): void {
    this.setupBreadcrumbs();
  }

  private setupBreadcrumbs(): void{
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe(() => {
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
      });
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
