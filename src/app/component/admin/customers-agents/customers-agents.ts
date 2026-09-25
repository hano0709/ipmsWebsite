import { ChangeDetectorRef, Component, inject, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Customer } from '../../../interface/customer';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { DrawerModule } from 'primeng/drawer';
import { Agent } from '../../../interface/agent';
import { Router } from '@angular/router';

type EditableCustomerField = 'fullName' | 'dateOfBirth' | 'gender' | 'phone' | 'address' | 'kycStatus';

@Component({
  selector: 'app-customers-agents',
  standalone: true,                                   // <-- mark as standalone
  imports: [
    CommonModule,
    FormsModule,
    DialogModule,
    DrawerModule
  ],
  templateUrl: './customers-agents.html',
  styleUrl: './customers-agents.css',
})

export class CustomersAgentsComponent implements OnInit {
  private readonly server: string = 'https://localhost:8080/api/v1';

  customers = signal<Customer[]>([]);
  selectedCustomer: Customer | null = null;
  searchName = '';
  filterStatus = '';
  filterKyc = '';
  showPassword = false;
  emailError = '';
  passwordError = '';
  currentPage = signal(0);
  pageSize = 10;
  hasNextPage = signal(true);
  displayDialog = false;
  editDialog = false;
  editedFields: Partial<Customer> = {};
  addPanelVisible = false;
  entityType: 'CUSTOMER' | 'AGENT' = 'CUSTOMER';
  newCustomer: Partial<Customer> = {
    fullName: '',
    dateOfBirth: '',
    gender: 'MALE',
    phone: '',
    address: ''
  }
  newAgent: Partial<Agent> = {
    fullName: '',
    licenseNumber: ''
  }
  newEmail = '';
  newPassword = '';

  private http = inject(HttpClient);
  private router = inject(Router);
  private cd = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.loadCustomers();

    const url = this.router.url;
    if(url.includes('/customers/add')) {
      this.entityType = 'CUSTOMER';
      this.openAddPanel();
    } else if(url.includes('/agents/add')){
      this.entityType = 'AGENT';
      this.openAddPanel();
    }
  }

  loadCustomers(page = 0): void {
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

  onFieldChange(field: EditableCustomerField, value: string): void {
    if(!this.selectedCustomer) return;

    if((this.selectedCustomer)[field] !== value){
      this.editedFields[field] = value;
    } else {
      delete this.editedFields[field];
    }
  }

  saveCustomer(): void{
    if(!this.selectedCustomer) return;

    const payload: Partial<Customer> = {customerCode: this.selectedCustomer.customerCode};

    for(const key of Object.keys(this.editedFields) as EditableCustomerField[]){
      payload[key] = this.editedFields[key];
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
    const payload: Partial<Customer> = {
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

  openAddPanel(): void {
    this.emailError = '';
    this.passwordError = '';
    this.addPanelVisible = true;
  }

  closeAddPanel(): void {
    this.addPanelVisible = false;

    this.emailError = '';
    this.passwordError = '';
    this.resetForms();
  }

  saveNewEntity(): void {
    if(this.entityType === 'CUSTOMER'){
      const payload = {
        ...this.newCustomer,
        email: this.newEmail,
        password: this.newPassword
      }

      this.http.post(`${this.server}/customers`, payload).subscribe ({
        next: () => {
          this.closeAddPanel();
          this.loadCustomers(0);
        },
        error: (err) => {
          console.error(err);
          
          const message = err?.error?.message ?? 'Something went wrong';
          console.error(message);
          
          this.emailError = '';
          this.passwordError = '';

          if (message.toLowerCase().includes('email')) {
            this.emailError = message;
          } else if (message.toLowerCase().includes('password')) {
              this.passwordError = message;
          }

          this.cd.detectChanges();
        }
      });
    } else {
      const payload = {
        ...this.newAgent,
        email: this.newEmail,
        password: this.newPassword
      }

      this.http.post(`${this.server}/agents`, payload).subscribe({
        next: () => {
          this.closeAddPanel();
          this.loadCustomers(0);
        },
        error: (err) => {
          console.error(err);
          
          const message = err?.error?.message ?? 'Something went wrong';
          
          this.emailError = '';
          this.passwordError = '';

          if (message.toLowerCase().includes('email')) {
            this.emailError = message;
          } else if (message.toLowerCase().includes('password')) {
              this.passwordError = message;
          }

          this.cd.detectChanges();
        }
      });
    }
  }

  resetForms(): void {
    this.newCustomer = {
      fullName: '',
      dateOfBirth: '',
      gender: 'MALE',
      phone: '',
      address: ''
    };
    this.newAgent = {
      fullName: '',
      licenseNumber: '' 
    };
    this.newEmail = '';
    this.newPassword = '';
  }
}
