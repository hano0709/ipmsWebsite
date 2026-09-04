import { Component, OnInit } from '@angular/core';
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
  notificationCount = 3;

  constructor(private router: Router, private route: ActivatedRoute) {}

  ngOnInit(): void {
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
}
