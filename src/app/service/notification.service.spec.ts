import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';

import { NotificationService } from './notification.service';
import { notification } from '../interface/notification';

describe('NotificationService', () => {

  let service: NotificationService;
  let httpMock: HttpTestingController;

  const mockNotifications: notification[] = [
    {
      id: 1,
      title: 'Policy Activated',
      message: 'Policy IPMS-001 activated'
    } as notification,
    {
      id: 2,
      title: 'Policy Renewed',
      message: 'Policy IPMS-002 renewed'
    } as notification
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });

    service = TestBed.inject(NotificationService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create service', () => {
    expect(service).toBeTruthy();
  });

  it('should load notifications', () => {
    service.loadNotifications();

    const req = httpMock.expectOne(
      'https://localhost:8080/api/v1/notifications'
    );

    expect(req.request.method).toBe('GET');

    req.flush(mockNotifications);

    expect(service.notifications()).toEqual(mockNotifications);
    expect(service.notificationCount()).toBe(2);
  });

  it('should return notification count', () => {
    service.notifications.set(mockNotifications);

    expect(service.notificationCount()).toBe(2);
  });

  it('should remove notification when markAsRead succeeds', () => {

    service.notifications.set(mockNotifications);

    service.markAsRead(1);

    const req = httpMock.expectOne(
      'https://localhost:8080/api/v1/notifications/1/read'
    );

    expect(req.request.method).toBe('PATCH');

    req.flush({});

    expect(service.notifications().length).toBe(1);
    expect(service.notifications()[0].id).toBe(2);
    expect(service.notificationCount()).toBe(1);
  });

  it('should not modify notifications if markAsRead fails', () => {

    service.notifications.set(mockNotifications);

    spyOn(console, 'error');

    service.markAsRead(1);

    const req = httpMock.expectOne(
      'https://localhost:8080/api/v1/notifications/1/read'
    );

    req.flush(
      {},
      {
        status: 500,
        statusText: 'Server Error'
      }
    );

    expect(service.notifications().length).toBe(2);

    expect(console.error).toHaveBeenCalled();
  });

  it('should handle loadNotifications error', () => {

    spyOn(console, 'error');

    service.loadNotifications();

    const req = httpMock.expectOne(
      'https://localhost:8080/api/v1/notifications'
    );

    req.flush(
      {},
      {
        status: 500,
        statusText: 'Server Error'
      }
    );

    expect(console.error).toHaveBeenCalled();
  });

});