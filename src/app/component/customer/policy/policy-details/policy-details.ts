import { Component, OnInit, signal, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Policy } from '../../../../interface/policy';
import { PolicyDocument } from '../../../../interface/policyDocument';
import { DialogModule } from 'primeng/dialog';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-policy-details',
  imports: [CommonModule, DialogModule, FormsModule],
  templateUrl: './policy-details.html',
  styleUrls: ['./policy-details.css'],
})
export class PolicyDetails implements OnInit {
  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);

  private readonly server = 'https://localhost:8080/api/v1';

  // Signals for state
  policy = signal<Policy | null>(null);
  documents = signal<PolicyDocument[]>([]);

  ngOnInit(): void {
    const policyNumber = this.route.snapshot.paramMap.get('policyNumber');
    if (policyNumber) {
      this.loadPolicy(policyNumber);
    }
  }

  // Load policy details
  loadPolicy(policyNumber: string): void {
    this.http.get<Policy>(`${this.server}/policies/${policyNumber}`).subscribe({
      next: (data) => {
        this.policy.set(data);
        this.loadDocuments(data.id); // pass the id here
      },
      error: (err) => console.error('Failed to load policy details', err),
    });
  }

  // Load documents
  loadDocuments(policyId: number): void {
    this.http.get<PolicyDocument[]>(`${this.server}/policies/${policyId}/documents`).subscribe({
      next: (data) => {
        this.documents.set(data);
        console.log('Documents loaded:', data);
      },
      error: (err) => console.error('Failed to load documents', err),
    });
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
    const id = this.policy()?.id;
    if (!id) return;

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.doc,.docx';

    input.onchange = () => {
      const file = (input.files && input.files[0]) || null;
      if (!file) return;

      const formData = new FormData();
      formData.append('file', file);

      this.http
        .post(`${this.server}/policies/${id}/documents`, formData, { responseType: 'text' })
        .subscribe({
          next: () => {
            this.loadDocuments(id);
          },
          error: (err) => console.error('Failed to upload Doc', err),
        });
    };

    input.click();
  }
}
