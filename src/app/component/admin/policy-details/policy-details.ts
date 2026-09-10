import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Policy } from '../../../interface/policy';
import { PolicyDocument } from '../../../interface/policyDocument';
import { PolicyAudit } from '../../../interface/policyAudit';

@Component({
  selector: 'app-policy-details',
  imports: [CommonModule],
  templateUrl: './policy-details.html',
  styleUrls: ['./policy-details.css']
})
export class PolicyDetails implements OnInit {
  private readonly server = 'http://localhost:8080/api/v1';

  // Signals for state
  policy = signal<Policy | null>(null);
  documents = signal<PolicyDocument[]>([]);
  auditTrail = signal<PolicyAudit[]>([]);

  constructor(private route: ActivatedRoute, private http: HttpClient) {}

  ngOnInit(): void {
    const policyNumber = this.route.snapshot.paramMap.get('policyNumber');
    if (policyNumber) {
      this.loadPolicy(policyNumber);
      this.loadAuditTrail(policyNumber);
    }
  }

  // Load policy details
  loadPolicy(policyNumber: string): void {
    this.http.get<Policy>(`${this.server}/policies/${policyNumber}`).subscribe({
      next: (data) => {
        this.policy.set(data);
        this.loadDocuments(data.id);   // pass the id here
      },
      error: (err) => console.error('Failed to load policy details', err)
    });
  }

  // Load documents
  loadDocuments(policyId: number): void {
    this.http.get<PolicyDocument[]>(`${this.server}/policies/${policyId}/documents`).subscribe({
      next: (data) => {
        this.documents.set(data);
        console.log('Documents loaded:', data);
      },
      error: (err) => console.error('Failed to load documents', err)
    });
  }

  // Load audit trail
  loadAuditTrail(policyNumber: string): void {
    this.http.get<PolicyAudit[]>(`${this.server}/policies/${policyNumber}/audit`).subscribe({
      next: (data) => this.auditTrail.set(data),
      error: (err) => console.error('Failed to load audit trail', err)
    });
  }

  // Status transition actions
  transition(newStatus: string): void {
    const policyNumber = this.policy()?.policyNumber;
    if (!policyNumber) return;

    if (newStatus === 'ACTIVE') {
      this.http.patch(`${this.server}/policies/${policyNumber}/activate`, {}).subscribe({
        next: () => {
          this.loadPolicy(policyNumber),
          this.loadAuditTrail(policyNumber)
        },
        error: (err) => console.error("Failed to activate Policy", err)
      });
    } else if (newStatus === 'RENEWED') {
      this.http.patch(`${this.server}/policies/${policyNumber}/renew`, {}).subscribe({
        next: () => {
          this.loadPolicy(policyNumber),
          this.loadAuditTrail(policyNumber)
        },
        error: (err) => console.error("Failed to renew Policy", err)
      });
    } else if (newStatus === 'SUSPENDED') {
      this.http.patch(`${this.server}/policies/${policyNumber}/suspend`, {}).subscribe({
        next: () => {
          this.loadPolicy(policyNumber),
          this.loadAuditTrail(policyNumber)
        },
        error: (err) => console.error("Failed to suspend Policy", err)
      });
    } else if (newStatus === 'CANCELLED') {
      this.http.patch(`${this.server}/policies/${policyNumber}/cancel`, {}).subscribe({
        next: () => {
          this.loadPolicy(policyNumber),
          this.loadAuditTrail(policyNumber)
        },
        error: (err) => console.error("Failed to cancel Policy", err)
      });
    }
  }

  // Document actions
  downloadDoc(doc: PolicyDocument): void {
  this.http.get(`${this.server}/documents/${doc.id}/download`, { responseType: 'blob' })
    .subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = doc.fileName; 
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => console.error('Failed to download document', err)
    });
  }

  uploadDoc(): void {
    // Placeholder: implement file upload dialog
    console.log('Upload document clicked');
  }
}
