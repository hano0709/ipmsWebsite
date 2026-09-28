import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';

import { UserService } from './user.service';
import { User } from '../interface/user';

describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;

  const mockUser: User = {
    accessToken: 'jwt-token',
    refreshToken: 'refresh-token',
    role: 'AGENT'
  } as User;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [UserService]
    });

    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);

    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should login successfully and store tokens', () => {
    service.login('test@test.com', 'password').subscribe(user => {
      expect(user).toEqual(mockUser);

      expect(localStorage.getItem('jwt'))
        .toBe(mockUser.accessToken);

      expect(localStorage.getItem('refreshToken'))
        .toBe(mockUser.refreshToken);
    });

    const req = httpMock.expectOne(
      'https://localhost:8080/api/v1/auth/login'
    );

    expect(req.request.method).toBe('POST');

    expect(req.request.body).toEqual({
      email: 'test@test.com',
      password: 'password'
    });

    req.flush(mockUser);
  });

  it('should return server error message', () => {
    service.login('test@test.com', 'password')
      .subscribe({
        next: () => fail('should fail'),
        error: err => {
          expect(err).toBe('Invalid credentials');
        }
      });

    const req = httpMock.expectOne(
      'https://localhost:8080/api/v1/auth/login'
    );

    req.flush(
      { error: 'Invalid credentials' },
      { status: 401, statusText: 'Unauthorized' }
    );
  });

  it('should return generic server error when error body is missing', () => {
    service.login('test@test.com', 'password')
      .subscribe({
        next: () => fail('should fail'),
        error: err => {
          expect(err)
            .toBe('Server error - Error Status 500');
        }
      });

    const req = httpMock.expectOne(
      'https://localhost:8080/api/v1/auth/login'
    );

    req.flush(
      {},
      { status: 500, statusText: 'Server Error' }
    );
  });

  it('should return null when no token exists', () => {
    expect(service.getCurrentUser()).toBeNull();
  });

  it('should decode jwt and return current user', () => {
    const payload = {
      role: 'AGENT',
      sub: 'testuser'
    };

    const token =
      'header.' +
      btoa(JSON.stringify(payload)) +
      '.signature';

    localStorage.setItem('jwt', token);

    const user = service.getCurrentUser();

    expect(user).toEqual({
      role: 'AGENT',
      username: 'testuser'
    });
  });
});