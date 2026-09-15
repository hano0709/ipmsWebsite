import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { UserService } from '../service/user.service'; 

@Injectable({
  providedIn: 'root'
})
export class AgentGuard implements CanActivate {
  constructor(private userService: UserService, private router: Router) {}

  canActivate(): boolean {
    const user = this.userService.getCurrentUser(); 
    if (user && user.role === 'AGENT') {
      return true;
    }
    
    this.router.navigate(['/unauthorized']);
    return false;
  }
}
