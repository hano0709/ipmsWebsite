import { Component, signal, OnInit, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ButtonModule } from 'primeng/button';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Policy } from '../../../interface/policy';

@Component({
  selector: 'app-agent-dashboard',
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
  imports: [
    ButtonModule,
    RouterLink,
    CommonModule
  ]
})
export class Dashboard implements OnInit {
  private readonly server = 'http://localhost:8080/api/v1';

  policies = signal<Policy[]>([]);
  myPolicies = signal<number>(0);
  myActivePolicies = signal<number>(0);
  renewalDue = signal<number>(0);

  http = inject(HttpClient);

  ngOnInit(): void {
    this.loadPolicies();
  }

  private loadPolicies(): void {
    this.http.get<Policy[]>(`${this.server}/agents/policies`)
      .subscribe(policies => {
        this.policies.set(policies);
        this.myPolicies.set(policies.length);

        const activeCount = policies.filter(p => p.policyStatus === 'ACTIVE').length;
        this.myActivePolicies.set(activeCount);

        const now = new Date();
        const in30Days = new Date();
        in30Days.setDate(now.getDate() + 30);
        console.log(in30Days);
        console.log(now);
        const renewalCount = policies.filter(p => {
          const end = new Date(p.endDate);
          console.log(end);
          return end >= now && end <= in30Days;
        }).length;
        this.renewalDue.set(renewalCount);
      });
  }
}
