import { Component, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Customer } from '../../../interface/customer';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { single } from 'rxjs';

@Component({
  selector: 'app-customers-agents',
  standalone: true,                                   // <-- mark as standalone
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './customers-agents.html',
  styleUrl: './customers-agents.css',
})

export class CustomersAgentsComponent implements OnInit {
  private readonly server: string = 'http://localhost:8080/api/v1';

  customers = signal<Customer[]>([]);
  searchName = '';
  filterStatus = '';
  filterKyc = '';
  currentPage = signal(0);
  pageSize = 10;
  hasNextPage = signal(true);

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadCustomers();
  }

  private loadCustomers(page: number = 0): void {
    this.http.get<Customer[]>(`${this.server}/customers?page=${page}&size=${this.pageSize}`).subscribe({
      next: (data) => {
        this.currentPage.set(page);
        this.customers.set(data);

        this.hasNextPage.set(data.length === this.pageSize);
      },
      error: (err) => console.error('Failed to load customers', err)
    });
  }

  nextPage() : void {
    if(this.hasNextPage()){
      this.loadCustomers(this.currentPage() + 1);
    }
  }

  prevPage(): void {
    if(this.currentPage() > 0){
      this.loadCustomers(this.currentPage() - 1);
    }
  }

  get filteredCustomers(): Customer[] {
    return this.customers().filter(c => {
      const matchesName = this.searchName
        ? c.fullName.toLowerCase().includes(this.searchName.toLowerCase())
        : true;

      const matchesStatus = this.filterStatus
        ? (this.filterStatus === 'ACTIVE' && c.kycStatus === 'VERIFIED') ||
          (this.filterStatus === 'INACTIVE' && c.kycStatus === 'REJECTED')
        : true;

      const matchesKyc = this.filterKyc
        ? c.kycStatus === this.filterKyc
        : true;

      return matchesName && matchesStatus && matchesKyc;
    });
  }

  viewCustomer(customer: Customer): void {
    console.log('View customer', customer);
    // TODO: navigate to detail page
  }

  editCustomer(customer: Customer): void {
    console.log('Edit customer', customer);
    // TODO: navigate to edit form
  }

  toggleKycStatus(customer: Customer): void {
    const newStatus = customer.kycStatus === 'VERIFIED' ? 'REJECTED' : 'VERIFIED';

    // Optimistic update on frontend
    customer.kycStatus = newStatus;

    // Call backend to persist change
    this.http.put(`${this.server}/customers/${customer.id}/kyc-status`, { kycStatus: newStatus })
      .subscribe({
        next: () => console.log(`Customer ${customer.id} KYC updated to ${newStatus}`),
        error: (err) => console.error('Failed to update KYC status', err)
      });
  }
}
