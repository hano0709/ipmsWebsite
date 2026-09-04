import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { UserService } from '../service/user.service'; // your auth service

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  constructor(private userService: UserService, private router: Router) {}

  canActivate(): boolean {
    const user = this.userService.getCurrentUser(); // e.g. from JWT or localStorage
    if (user && user.role === 'ADMIN') {
      return true;
    }
    // 🚫 Not admin → redirect
    this.router.navigate(['/unauthorized']);
    return false;
  }
}
