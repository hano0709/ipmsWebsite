import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AdminGuard } from './admin-guard';
import { UserService } from '../service/user.service';

describe('AdminGuard', () => {
  let guard: AdminGuard;
  let userServiceSpy: jasmine.SpyObj<UserService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    userServiceSpy = jasmine.createSpyObj('UserService', ['getCurrentUser']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        AdminGuard,
        { provide: UserService, useValue: userServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    });

    guard = TestBed.inject(AdminGuard);
  });

  it('should allow access for ADMIN user', () => {
    userServiceSpy.getCurrentUser.and.returnValue({
      username: 'admin',
      role: 'ADMIN'
    });

    expect(guard.canActivate()).toBeTrue();
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });

  it('should deny access for CUSTOMER user', () => {
    userServiceSpy.getCurrentUser.and.returnValue({
      username: 'customer',
      role: 'CUSTOMER'
    });

    expect(guard.canActivate()).toBeFalse();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/unauthorized']);
  });

  it('should deny access when user is null', () => {
    userServiceSpy.getCurrentUser.and.returnValue(null);

    expect(guard.canActivate()).toBeFalse();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/unauthorized']);
  });
});