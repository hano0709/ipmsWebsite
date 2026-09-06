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
  breadcrumbs: { label: string, url: string }[] = [
    { label: 'Home', url: '/admin' }   // ✅ initialize with Home
  ];

  totalPolicies = signal(0);
  activePolicies = signal(0);
  expiringSoon = signal(0);
  totalCustomers = signal(0);

  notificationCount = 3;
  private readonly server: string = 'http://localhost:8080/api/v1';

  constructor(private router: Router, private route: ActivatedRoute, private http: HttpClient) {}

  ngOnInit(): void {
    this.setupBreadcrumbs();
    this.loadPolicyData();
    this.loadExpiringSoon();
    this.loadCustomers();
  }

  private loadPolicyData(): void {
    this.http.get<any[]>(`${this.server}/policies`).subscribe({
      next: (policies) => {
        // policies is already an array
        this.totalPolicies.set(policies.length);
        this.activePolicies.set(policies.filter(p => p.policyStatus === 'ACTIVE').length);

        console.log('policies array', policies);
        console.log('total policies', this.totalPolicies);
        console.log('active policies', this.activePolicies);
      },
      error: (err) => console.error('Failed to load policies', err)
    });
  }

  private loadExpiringSoon(): void {
    this.http.get<any[]>(`${this.server}/policies/expiring-soon`).subscribe({
      next: (policies) => {
        // also an array
        this.expiringSoon.set(policies.length);
        console.log('expiring-soon', this.expiringSoon);
      },
      error: (err) => console.error('Failed to load expiring policies', err)
    });
  }

  private loadCustomers(): void {
    this.http.get<any[]>(`${this.server}/customers?page=0&size=10`).subscribe({
      next: (customers) => {
        // customers is an array of customer objects
        this.totalCustomers.set(customers.length);
        console.log('total customers', this.totalCustomers);
      },
      error: (err) => console.error('Failed to load customers', err)
    });
  }

  private setupBreadcrumbs(): void{
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe(() => {
        const crumbs: { label: string, url: string }[] = [
          { label: 'Home', url: '/admin' }   // ✅ always start with Home
        ];

        let currentRoute = this.route.root;
        let url = '/admin';

        while (currentRoute.firstChild) {
          currentRoute = currentRoute.firstChild;
          if (currentRoute.snapshot.url.length) {
            url += '/' + currentRoute.snapshot.url.map((segment: any) => segment.path).join('/');
            crumbs.push({
              label: currentRoute.snapshot.data['breadcrumb'] || currentRoute.snapshot.url[0].path,
              url
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
