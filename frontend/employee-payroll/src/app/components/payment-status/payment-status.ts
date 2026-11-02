
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { RouterModule } from '@angular/router';

import { Auth, Employee } from '../../services/auth';

interface PaymentRecord {
  salary_month: number;
  salary_year: number;
  net_salary: number;
  payment_status: string;
  payment_date: string | null;
  salary_id?: number;
}

@Component({
  selector: 'app-payment-status',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './payment-status.html',
  styleUrl: './payment-status.css'
})
export class PaymentStatus implements OnInit {

  employee: Employee | null = null;

  payments: PaymentRecord[] = [];

  loading = false;
  errorMessage = '';

  constructor(
    private http: HttpClient,
    private auth: Auth
  ) {}

  ngOnInit(): void {
    this.employee = this.auth.getEmployee();
    this.loadPaymentStatus();
  }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      Authorization: `Bearer ${this.auth.getToken()}`
    });
  }

  loadPaymentStatus(): void {

    if (!this.auth.getToken()) {
      this.auth.logout();
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.http.get<any>(
      'http://127.0.0.1:5000/api/salary/payment-status',
      { headers: this.getHeaders() }
    ).subscribe({

      next: response => {

        this.payments = (response.payments || [])
          .sort((a: PaymentRecord, b: PaymentRecord) =>
            (Number(b.salary_year) * 100 + Number(b.salary_month)) -
            (Number(a.salary_year) * 100 + Number(a.salary_month))
          );

        this.loading = false;
      },

      error: error => {

        this.loading = false;

        if (error.status === 401) {
          this.auth.logout();
          return;
        }

        this.errorMessage = 'Unable to load payment information.';
      }

    });
  }

  periodLabel(record: PaymentRecord): string {

    const month = new Date(
      Number(record.salary_year),
      Number(record.salary_month) - 1
    ).toLocaleString('en-US', {
      month: 'long'
    });

    return `${month} ${record.salary_year}`;
  }

  formatCurrency(value: number): string {
    return Number(value || 0).toLocaleString('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    });
  }

  getPaymentStatusClass(status: string): string {

    switch (status?.toLowerCase()) {

      case 'paid':
        return 'status-paid';

      case 'rejected':
      case 'failed':
        return 'status-rejected';

      default:
        return 'status-pending';
    }
  }

  get paidCount(): number {
    return this.payments.filter(
      payment => payment.payment_status?.toLowerCase() === 'paid'
    ).length;
  }

  get pendingCount(): number {
    return this.payments.filter(
      payment => payment.payment_status?.toLowerCase() === 'pending'
    ).length;
  }

  get totalPaid(): number {
    return this.payments
      .filter(payment => payment.payment_status?.toLowerCase() === 'paid')
      .reduce((total, payment) => total + Number(payment.net_salary || 0), 0);
  }

  logout(): void {
    this.auth.logout();
  }

}
