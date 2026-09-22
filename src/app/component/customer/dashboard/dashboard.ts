import { Component, OnInit, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Policy } from '../../../interface/policy';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { Customer } from '../../../interface/customer';

@Component({
  selector: 'app-customer-dashboard',
  standalone: true,
  imports: [CommonModule, ButtonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  private http = inject(HttpClient);

  private readonly server = 'http://localhost:8080/api/v1';

  policies = signal<Policy[]>([]);
  myPolicies = signal<number>(0);
  myActivePolicies = signal<number>(0);
  renewalDue = signal<number>(0);
  customer: Customer | null = null;

  ngOnInit(): void {
    this.loadCustomerProfile();
  }

  private loadCustomerProfile(): void {
    this.http.get<Customer>(`${this.server}/customers/me`).subscribe({
      next: (cust) => {
        this.customer = cust;
        this.loadPolicies();
      },
      error: (err) => {
        console.error('Customer Loading Failed', err);
      },
    });
  }

  private loadPolicies(): void {
    const id = this.customer?.id;

    this.http.get<Policy[]>(`${this.server}/customers/${id}/policies`)
      .subscribe(policies => {
        this.policies.set(policies);
      });
  }
}
