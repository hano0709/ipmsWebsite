import { Component, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Policy } from '../../../../interface/policy';   
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { RouterModule } from '@angular/router';
import { Customer } from '../../../../interface/customer';

@Component({
  selector: 'app-policies-list',
  imports: [
    CommonModule,
    FormsModule,
    DialogModule,
    RouterModule
  ],
  templateUrl: './policies-list.html',
  styleUrl: './policies-list.css'
})
export class PoliciesList implements OnInit {
  private readonly server = 'http://localhost:8080/api/v1';

  policies = signal<Policy[]>([]);
  pageSize = signal(10);
  currentPage = signal(0);
  filterPolicyType = signal<string | null>(null);
  filterStatus = signal<string | null>(null);
  filterStartDate = signal<string | null>(null);
  filterEndDate = signal<string | null>(null);
  filterSearch = signal<string>("");
  customer: Customer | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadCustomerProfile();
  }
  
  private loadCustomerProfile(): void {
    this.http.get<Customer>(`${this.server}/customers/me`).subscribe({
      next: (cust) => {
        this.customer = cust;
        this.loadPolicies();
      },
      error: (err) => {console.error('Customer Loading Failed', err)}
    });
  }

  loadPolicies(): void {
    const id = this.customer?.id;
    
    this.http.get<Policy[]>(`${this.server}/customers/${id}/policies`).subscribe({
      next: (data) => {
        this.policies.set(data)
      },
      error: (err) => console.error('Failed to load policies', err)
    });
  }

  get paginatedPolicies(): Policy[] {
    const start = this.currentPage() * this.pageSize();
    return this.filteredPolicies.slice(start, start + this.pageSize());
  }

  nextPage(): void {
    const maxPage = Math.ceil(this.policies().length / this.pageSize()) - 1;
    if (this.currentPage() < maxPage) {
      this.currentPage.set(this.currentPage() + 1);
    }
  }


  prevPage(): void {
    if (this.currentPage() > 0) {
      this.currentPage.set(this.currentPage() - 1);
    }
  }

  get maxPage(): number {
    return Math.ceil(this.policies().length / this.pageSize()) - 1;
  }


  changePageSize(size: number): void {
    this.pageSize.set(size);
    this.currentPage.set(0);
  }

  get filteredPolicies(): Policy[] {
    return this.policies().filter(p => {
      if(this.filterPolicyType() && p.policyType !== this.filterPolicyType()){
        return false;
      }

      if (this.filterStatus() && p.policyStatus !== this.filterStatus()) {
        return false;
      }

      const start = this.filterStartDate() ? new Date(this.filterStartDate()!) : null;
      const end = this.filterEndDate() ? new Date(this.filterEndDate()!) : null;
      const policyStart = new Date(p.startDate);
      const policyEnd = new Date(p.endDate);
      if(start && policyStart < start) return false;
      if(end && policyEnd > end) return false;

      if(this.filterSearch() &&
        !p.policyNumber.toLowerCase().includes(this.filterSearch().toLowerCase()) &&
        !p.customerCode.toLowerCase().includes(this.filterSearch().toLowerCase())
      ) {
        return false;
      }

      return true;
    });
  }
}
