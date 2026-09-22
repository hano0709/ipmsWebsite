import { Component, inject, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Customer } from '../../../interface/customer';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { DrawerModule } from 'primeng/drawer';

type EditableCustomerField = 'fullName' | 'dateOfBirth' | 'gender' | 'phone' | 'address' | 'kycStatus';

@Component({
  selector: 'app-agent-customers',
  imports: [
    CommonModule,
    FormsModule,
    DialogModule,
    DrawerModule
  ],
  templateUrl: './customers.html',
  styleUrl: './customers.css',
})
export class Customers implements OnInit {
  private readonly server: string = 'http://localhost:8080/api/v1';

  customers = signal<Customer[]>([]);
  selectedCustomer: Customer | null = null;
  searchName = '';
  filterKyc = '';
  currentPage = signal(0);
  pageSize = 10;
  hasNextPage = signal(true);

  displayDialog = false;
  editDialog = false;
  editedFields: Partial<Customer> = {};
  addPanelVisible = false;

  newCustomer: Partial<Customer> = {
    fullName: '',
    dateOfBirth: '',
    gender: 'MALE',
    phone: '',
    address: ''
  };
  newEmail = '';
  newPassword = '';

  http = inject(HttpClient);

  ngOnInit(): void {
    this.loadCustomers();
  }

  loadCustomers(page = 0): void {
    let url = `${this.server}/customers?page=${page}&size=${this.pageSize}`;
    if (this.filterKyc) {
      url += `&kycStatus=${this.filterKyc}`;
    }
    if (this.searchName) {
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

  nextPage(): void {
    if (this.hasNextPage()) {
      this.loadCustomers(this.currentPage() + 1);
    }
  }

  prevPage(): void {
    if (this.currentPage() > 0) {
      this.loadCustomers(this.currentPage() - 1);
    }
  }

  viewCustomer(customer: Customer): void {
    this.selectedCustomer = customer;
    this.displayDialog = true;
  }

  closeDialog(): void {
    this.displayDialog = false;
    this.selectedCustomer = null;
  }

  editCustomer(customer: Customer): void {
    this.selectedCustomer = { ...customer };
    this.editedFields = {};
    this.editDialog = true;
  }

  closeEditDialog(): void {
    this.editDialog = false;
    this.selectedCustomer = null;
    this.editedFields = {};
  }

  onFieldChange(field: EditableCustomerField, value: string): void {
    if (!this.selectedCustomer) return;

    if ((this.selectedCustomer)[field] !== value) {
      this.editedFields[field] = value;
    } else {
      delete this.editedFields[field];
    }
  }

  saveCustomer(): void {
    if (!this.selectedCustomer) return;

    const payload: Partial<Customer> = { customerCode: this.selectedCustomer.customerCode };

    for (const key of Object.keys(this.editedFields) as EditableCustomerField[]) {
      payload[key] = this.editedFields[key];
    }

    this.http.put(`${this.server}/customers`, payload).subscribe({
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

    // Optimistic update
    customer.kycStatus = newStatus;
    const payload: Partial<Customer> = {
      customerCode: customer.customerCode,
      kycStatus: customer.kycStatus
    };

    this.http.put(`${this.server}/customers`, payload).subscribe({
      next: () => this.loadCustomers(this.currentPage()),
      error: (err) => console.error('Failed to update KYC status', err)
    });
  }

  openAddPanel(): void {
    this.addPanelVisible = true;
  }

  closeAddPanel(): void {
    this.addPanelVisible = false;
    this.resetForms();
  }

  saveNewCustomer(): void {
    const payload = {
      ...this.newCustomer,
      email: this.newEmail,
      password: this.newPassword
    };

    this.http.post(`${this.server}/customers`, payload).subscribe({
      next: () => {
        this.closeAddPanel();
        this.loadCustomers(0);
      },
      error: (err) => console.error('Failed to create customer', err)
    });
  }

  resetForms(): void {
    this.newCustomer = {
      fullName: '',
      dateOfBirth: '',
      gender: 'MALE',
      phone: '',
      address: ''
    };
    this.newEmail = '';
    this.newPassword = '';
  }
}
