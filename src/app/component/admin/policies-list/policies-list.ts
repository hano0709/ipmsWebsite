import { Component, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Policy } from '../../../interface/policy';   
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';

@Component({
  selector: 'app-policies-list',
  imports: [
    CommonModule,
    FormsModule,
    DialogModule
  ],
  templateUrl: './policies-list.html',
  styleUrl: './policies-list.css'
})
export class PoliciesList implements OnInit {
  private readonly server = 'http://localhost:8080/api/v1';

  policies = signal<Policy[]>([]);
  pageSize = signal(10);
  currentPage = signal(0);
  viewDialogVisible = signal(false);
  selectedPolicy = signal<Policy | null>(null);
  editDialogVisible = signal(false);
  editPolicyData = signal<Partial<Policy>>({});

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadPolicies();
  }

  loadPolicies(): void {
    this.http.get<Policy[]>(`${this.server}/policies`).subscribe({
      next: (data) => {
        this.policies.set(data),
        console.log('Policies from backend:', data);
      },
      error: (err) => console.error('Failed to load policies', err)
    });
  }

  get paginatedPolicies(): Policy[] {
    const start = this.currentPage() * this.pageSize();
    return this.policies().slice(start, start + this.pageSize());
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

  // Example action handlers
  viewPolicy(policy: Policy): void {
    this.selectedPolicy.set(policy);
    this.viewDialogVisible.set(true);
  }

  closeViewDialog(): void {
    this.viewDialogVisible.set(false);
    this.selectedPolicy.set(null);
  }

  editPolicy(policy: Policy): void {
    if (policy.policyStatus === 'DRAFT') {
      this.selectedPolicy.set(policy);
      this.editPolicyData.set({
        policyType: policy.policyType,
        sumInsured: policy.sumInsured,
        startDate: policy.startDate,
        endDate: policy.endDate,
        description: policy.description
      });
      this.editDialogVisible.set(true);
    }
  }

  savePolicyEdits(): void {
    const policyNumber = this.selectedPolicy()?.policyNumber;
    if(!policyNumber) return;

    const payload = {
      ...this.editPolicyData(),
      customerCode: this.selectedPolicy()?.customerCode
    };

    this.http.put(`${this.server}/policies/${policyNumber}`, payload).subscribe({
      next: () => {
        this.editDialogVisible.set(false);
        this.selectedPolicy.set(null);
        this.loadPolicies();
      }
    })
  }

  transitionStatus(policy: Policy, newStatus: string): void {
    console.log(`Transition ${policy.policyNumber} to ${newStatus}`);
    // TODO: call backend PUT here
  }
}
