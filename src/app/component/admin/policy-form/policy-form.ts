import { CommonModule } from '@angular/common';
import { Component, signal, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup, FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { debounceTime, switchMap } from 'rxjs/operators';
import { AutoCompleteModule, AutoCompleteSelectEvent } from 'primeng/autocomplete';
import { Customer } from '../../../interface/customer';
import { Observable } from 'rxjs';
import { Agent } from '../../../interface/agent';
import { Router } from '@angular/router';

@Component({
  selector: 'app-policy-form',
  imports: [
    CommonModule, 
    ReactiveFormsModule,
    AutoCompleteModule,
    FormsModule
  ],
  templateUrl: './policy-form.html',
  styleUrl: './policy-form.css',
})
export class PolicyForm implements OnInit {
  private readonly server = 'http://localhost:8080/api/v1';

  currentStep = signal(1);
  form!: FormGroup;
  premium = signal<number>(0);
  savedPolicyNumber = signal<string | null>(null);
  filteredCustomers: Customer[] = [];
  customers$!: Observable<Customer[]>;
  agents$!: Observable<Agent[]>;

  constructor(private fb: FormBuilder, private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      policyType: ['', Validators.required],
      customerCode: ['', Validators.required],
      customerDob: [''],   
      agentCode: ['', Validators.required],
      sumInsured: [null, Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      description: ['']
    });

    this.customers$ = this.form.controls['customerCode'].valueChanges.pipe(
      debounceTime(300),
      switchMap(code => this.searchCustomersByCode(code))
    );

    this.agents$ = this.form.controls['agentCode'].valueChanges.pipe(
      debounceTime(300),
      switchMap(code => this.searchAgentsByCode(code))
    );

    this.form.valueChanges.subscribe(() => this.calculatePremium());
  }

  nextStep(): void { this.currentStep.set(this.currentStep() + 1); }
  prevStep(): void { this.currentStep.set(this.currentStep() - 1); }

  calculatePremium(): void {
    const sumInsured = this.form.value.sumInsured || 0;
    const policyType = this.form.value.policyType;
    let premium = 0;

    if (policyType === 'LIFE') {
      const baseRate = 0.5 / 100;
      const dob = new Date(this.form.value.customerDob);
      const age = new Date().getFullYear() - dob.getFullYear();
      let ageFactor = 1.0;
      if (age > 30 && age <= 50) ageFactor = 1.2;
      else if (age > 50) ageFactor = 1.5;

      premium = sumInsured * baseRate * ageFactor;

    } else if (policyType === 'HEALTH') {
      const baseRate = 1.2 / 100;
      const start = new Date(this.form.value.startDate);
      const end = new Date(this.form.value.endDate);
      const duration = end.getFullYear() - start.getFullYear();
      let durationFactor = 1.0;
      if (duration === 2) durationFactor = 0.95;
      else if (duration > 2) durationFactor = 0.90;

      premium = sumInsured * baseRate * durationFactor;

    } else if (policyType === 'MOTOR') {
      const baseRate = 2.0 / 100;
      premium = sumInsured * baseRate;

    } else if (policyType === 'PROPERTY') {
      const baseRate = 0.8 / 100;
      premium = sumInsured * baseRate;
    }

    this.premium.set(premium);
  }

  saveAsDraft(): void {
    this.http.post<{ "Policy created Successfully": string }>(`${this.server}/policies`, this.form.value).subscribe({
        next: (res) => {
          this.savedPolicyNumber.set(res["Policy created Successfully"]);
        },
        error: (err) => console.error('Failed to save draft', err)
      });
  }

  activate(): void {
    if (!this.savedPolicyNumber) {
      console.warn('Policy must be saved as draft before activation');
      return;
    }

    this.http.patch(`${this.server}/policies/${this.savedPolicyNumber()}/activate`, {})
      .subscribe({
        next: () => {
          this.router.navigate(['/admin/policies', this.savedPolicyNumber()]);
        },
        error: (err) => console.error('Failed to activate policy', err)
      });
  }

  searchCustomersByCode(query: string) {
    return this.http.get<Customer[]>(`${this.server}/customers/search?customerCode=${query}`);
  }

  searchAgentsByCode(query: string) {
    return this.http.get<Agent[]>(`${this.server}/agents/search?agentCode=${query}`);
  }

  onCustomerSelected(event: AutoCompleteSelectEvent): void {
    const customer = event.value as Customer;
    this.form.patchValue({
      customerCode: customer.customerCode,
      customerDob: customer.dateOfBirth
    });
  }

  onAgentSelected(event: AutoCompleteSelectEvent): void {
    const agent = event.value as Agent;
    this.form.patchValue({
      agentCode: agent.agentCode
    });
  }
}
