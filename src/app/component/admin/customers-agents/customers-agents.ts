import { Component, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Customer } from '../../../interface/customer';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';

@Component({
  selector: 'app-customers-agents',
  standalone: true,                                   // <-- mark as standalone
  imports: [
    CommonModule,
    FormsModule,
    DialogModule
  ],
  templateUrl: './customers-agents.html',
  styleUrl: './customers-agents.css',
})

export class CustomersAgentsComponent implements OnInit {
  private readonly server: string = 'http://localhost:8080/api/v1';

  customers = signal<Customer[]>([]);
  selectedCustomer: Customer | null = null;
  searchName = '';
  filterStatus = '';
  filterKyc = '';
  currentPage = signal(0);
  pageSize = 10;
  hasNextPage = signal(true);
  displayDialog = false;
  editDialog = false;
  editedFields: Partial<Customer> = {}

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadCustomers();
  }

  loadCustomers(page: number = 0): void {
    let url = `${this.server}/customers?page=${page}&size=${this.pageSize}`;
    if(this.filterKyc) {
      url += `&kycStatus=${this.filterKyc}`;
    }
    if(this.searchName) {
      url += `&searchName=${this.searchName}`;
    }

    this.http.get<Customer[]>(url).subscribe({
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

  viewCustomer(customer: Customer): void {
    this.selectedCustomer = customer;
    this.displayDialog = true;
  }

  closeDialog(): void{
    this.displayDialog = false;
    this.selectedCustomer = null;
  }

  editCustomer(customer: Customer): void {
    this.selectedCustomer = {...customer};
    this.editedFields = {};
    this.editDialog = true;
  }

  closeEditDialog():void {
    this.editDialog = false;
    this.selectedCustomer = null;
    this.editedFields = {};
  }

  onFieldChange(field: keyof Customer, value: string): void {
    if(!this.selectedCustomer) return;

    if((this.selectedCustomer as any)[field] !== value){
      this.editedFields[field] = value as any;
    } else {
      delete this.editedFields[field];
    }
  }

  saveCustomer(): void{
    if(!this.selectedCustomer) return;

    const payload: any = {customerCode: this.selectedCustomer.customerCode};

    for(const key of Object.keys(this.editedFields)){
      payload[key] = (this.editedFields as any)[key];
    }

    this.http.put(`${this.server}/customers`, payload).subscribe ({
      next: () => {
        this.closeDialog();
        this.loadCustomers(this.currentPage());
      },
      error: (err) => console.error('Update failed', err)
    });
  }

  get hasEditedFields(): boolean {
    return Object.keys(this.editedFields).length > 0;
  }

  toggleKycStatus(customer: Customer): void {
    const newStatus = customer.kycStatus === 'VERIFIED' ? 'REJECTED' : 'VERIFIED';

    // Optimistic update on frontend
    customer.kycStatus = newStatus;
    const payload: any = {
      customerCode: customer.customerCode,
      kycStatus: customer.kycStatus
    }

    // Call backend to persist change
    this.http.put(`${this.server}/customers`, payload)
      .subscribe({
        next: () => {
          this.loadCustomers(this.currentPage());
        },
        error: (err) => console.error('Failed to update KYC status', err)
      });
  }
}
