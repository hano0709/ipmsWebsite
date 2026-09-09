import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, signal } from '@angular/core';
import { Policy } from '../../../interface/policy';
import { Customer } from '../../../interface/customer';
import { PolicyAuditLogDTO } from '../../../interface/policyAuditLogDTO';
import { ButtonModule } from 'primeng/button';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
  imports: [
    CommonModule,
    ButtonModule,
    RouterLink
  ]
})
export class Dashboard implements OnInit {
  totalPolicies = signal(0);
  activePolicies = signal(0);
  expiringSoon = signal(0);
  totalCustomers = signal(0);
  recentChanges = signal<PolicyAuditLogDTO[]>([]);

  private readonly server: string = 'http://localhost:8080/api/v1';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadPolicyData();
    this.loadExpiringSoon();
    this.loadCustomerCount();
    this.loadRecentChanges();
  }

  private loadPolicyData(): void {
    this.http.get<Policy[]>(`${this.server}/policies`).subscribe({
      next: (policies) => {
        this.totalPolicies.set(policies.length);
        this.activePolicies.set(policies.filter(p => p.policyStatus === 'ACTIVE').length);
      },
      error: (err) => console.error('Failed to load policies', err)
    });
  }

  private loadExpiringSoon(): void {
    this.http.get<Policy[]>(`${this.server}/policies/expiring-soon`).subscribe({
      next: (policies) => this.expiringSoon.set(policies.length),
      error: (err) => console.error('Failed to load expiring policies', err)
    });
  }

  private loadCustomerCount(): void {
    this.http.get<{ Count: number }>(`${this.server}/customers/count`).subscribe({
      next: (res) => this.totalCustomers.set(res.Count),
      error: (err) => console.error('Failed to load customer count', err)
    });
  }

  private loadRecentChanges(): void {
    this.http.get<PolicyAuditLogDTO[]>(`${this.server}/policies/state-changes`).subscribe({
      next: (changes) => this.recentChanges.set(changes),
      error: (err) => console.error('Failed to load recent changes', err)
    });
  }
}
