import { TestBed } from '@angular/core/testing';
import {
  HttpClient,
  provideHttpClient,
  withInterceptors
} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';

import { RefreshInterceptor } from './refresh.interceptor';

describe('RefreshInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(
          withInterceptors([RefreshInterceptor])
        ),
        provideHttpClientTesting()
      ]
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);

    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should pass successful requests through', () => {
    http.get('/test').subscribe(res => {
      expect(res).toEqual({ success: true });
    });

    const req = httpMock.expectOne('/test');
    req.flush({ success: true });
  });

  it('should refresh token and retry request on 401', () => {
    localStorage.setItem('refreshToken', 'old-refresh');

    let response: unknown;

    http.get('/test').subscribe(res => {
      response = res;
    });

    const originalReq = httpMock.expectOne('/test');

    originalReq.flush(
      {},
      { status: 401, statusText: 'Unauthorized' }
    );

    const refreshReq = httpMock.expectOne(
      'https://localhost:8080/api/v1/auth/refresh'
    );

    expect(refreshReq.request.body).toEqual({
      refreshToken: 'old-refresh'
    });

    refreshReq.flush({
      accessToken: 'new-access',
      refreshToken: 'new-refresh'
    });

    const retryReq = httpMock.expectOne('/test');

    expect(
      retryReq.request.headers.get('Authorization')
    ).toBe('Bearer new-access');

    retryReq.flush({ success: true });

    expect(response).toEqual({ success: true });
    expect(localStorage.getItem('jwt'))
      .toBe('new-access');
    expect(localStorage.getItem('refreshToken'))
      .toBe('new-refresh');
  });

  it('should throw error when refresh token is missing', () => {
    http.get('/test').subscribe({
      next: () => fail('should fail'),
      error: err => {
        expect(err.status).toBe(401);
      }
    });

    const req = httpMock.expectOne('/test');

    req.flush(
      {},
      { status: 401, statusText: 'Unauthorized' }
    );
  });

  it('should throw error when refresh request fails', () => {
    localStorage.setItem('refreshToken', 'old-refresh');

    http.get('/test').subscribe({
      next: () => fail('should fail'),
      error: err => {
        expect(err.status).toBe(403);
      }
    });

    const originalReq = httpMock.expectOne('/test');

    originalReq.flush(
      {},
      { status: 401, statusText: 'Unauthorized' }
    );

    const refreshReq = httpMock.expectOne(
      'https://localhost:8080/api/v1/auth/refresh'
    );

    refreshReq.flush(
      {},
      { status: 403, statusText: 'Forbidden' }
    );
  });
});