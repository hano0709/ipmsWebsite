import { Component, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Policy } from '../../../interface/policy';   
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-policies-list',
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './policies-list.html',
  styleUrl: './policies-list.css'
})
export class PoliciesList implements OnInit {
  private readonly server = 'http://localhost:8080/api/v1';

  policies = signal<Policy[]>([]);
  pageSize = signal(10);
  currentPage = signal(0);

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadPolicies();
  }

  loadPolicies(): void {
    this.http.get<Policy[]>(`${this.server}/policies`).subscribe({
      next: (data) => this.policies.set(data),
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
    console.log('Viewing policy', policy);
  }

  editPolicy(policy: Policy): void {
    if (policy.policyStatus === 'DRAFT') {
      console.log('Editing policy', policy);
    }
  }

  transitionStatus(policy: Policy, newStatus: string): void {
    console.log(`Transition ${policy.policyNumber} to ${newStatus}`);
    // TODO: call backend PUT here
  }
}
