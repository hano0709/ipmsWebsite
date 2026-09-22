import { inject, Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { UserService } from '../service/user.service'; 

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {

  userService = inject(UserService);
  router = inject(Router);

  canActivate(): boolean {
    const user = this.userService.getCurrentUser(); 
    if (user && user.role === 'ADMIN') {
      return true;
    }
    
    this.router.navigate(['/unauthorized']);
    return false;
  }
}
