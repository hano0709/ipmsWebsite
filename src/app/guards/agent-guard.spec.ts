import { Router } from '@angular/router';
import { UserService } from '../service/user.service'
import { AgentGuard } from './agent-guard'
import { TestBed } from '@angular/core/testing';

describe('AgentGuard', () => {
    let guard: AgentGuard;
    let userServiceSpy: jasmine.SpyObj<UserService>;
    let routerSpy: jasmine.SpyObj<Router>;

    beforeEach(() => {
        userServiceSpy = jasmine.createSpyObj('UserService', ['getCurrentUser']);
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);

        TestBed.configureTestingModule({
            providers: [
                AgentGuard,
                { provide: UserService, useValue: userServiceSpy },
                { provide: Router, useValue: routerSpy},
            ]
        });

        guard = TestBed.inject(AgentGuard);
    })

    it('should allow access for AGENT User', () => {
        userServiceSpy.getCurrentUser.and.returnValue({
            username: 'agent',
            role: 'AGENT',
        });

        expect(guard.canActivate()).toBeTrue();
        expect(routerSpy.navigate).not.toHaveBeenCalled();
    })

    it('should deny for CUSTOMER User', () => {
        userServiceSpy.getCurrentUser.and.returnValue({
            username: 'customer',
            role: "CUSTOMER",
        });

        expect(guard.canActivate()).toBeFalse();
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/unauthorized']);
    })
})