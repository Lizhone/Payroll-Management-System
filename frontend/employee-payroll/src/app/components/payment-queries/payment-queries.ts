
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { RouterModule } from '@angular/router';

import { Auth, Employee } from '../../services/auth';

interface PaymentQuery {
  query_id: number;
  subject: string;
  message: string;
  status: string;
  response?: string | null;
  created_at: string;
  updated_at?: string | null;
}

interface SalaryRecord {
  salary_id?: number;
  salary_month: number;
  salary_year: number;
}

@Component({
  selector: 'app-payment-queries',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './payment-queries.html',
  styleUrl: './payment-queries.css'
})
export class PaymentQueries implements OnInit {

  // Employee information
  employee: Employee | null = null;

  // Query history
  queries: PaymentQuery[] = [];

  // Salary periods
  payPeriods: string[] = [];

  // Query form fields
  queryType = '';
  payPeriod = '';
  description = '';

  // Query type options
  queryTypes: string[] = [
    'Salary Discrepancy',
    'Missing Payment',
    'Incorrect Deductions',
    'Payment Date Issue',
    'Payslip Issue',
    'Other'
  ];

  // Loading states
  loading = false;
  submitting = false;

  // Feedback messages
  errorMessage = '';
  successMessage = '';

  // Backend API URLs
  private readonly salaryApi =
    'http://127.0.0.1:5000/api/salary/history';

  private readonly queryApi =
    'http://127.0.0.1:5000/api/payment-queries/';

  constructor(
    private http: HttpClient,
    private auth: Auth
  ) {}

  // Initialize component
  ngOnInit(): void {

    this.employee = this.auth.getEmployee();

    if (!this.auth.getToken()) {
      this.auth.logout();
      return;
    }

    this.loadPayPeriods();
    this.loadQueries();
  }

  // JWT authorization headers
  private getHeaders(): HttpHeaders {

    return new HttpHeaders({
      Authorization: `Bearer ${this.auth.getToken()}`
    });

  }

  // Load salary periods from backend
  loadPayPeriods(): void {

    this.http.get<any>(
      this.salaryApi,
      { headers: this.getHeaders() }
    ).subscribe({

      next: response => {

        const records: SalaryRecord[] =
          response.salary_history || [];

        this.payPeriods = records
          .sort((a, b) =>
            (Number(b.salary_year) * 100 + Number(b.salary_month)) -
            (Number(a.salary_year) * 100 + Number(a.salary_month))
          )
          .map(record => {

            const month = new Date(
              Number(record.salary_year),
              Number(record.salary_month) - 1
            ).toLocaleString('en-US', {
              month: 'long'
            });

            return `${month} ${record.salary_year}`;

          });

      },

      error: error => {

        if (error.status === 401) {
          this.auth.logout();
          return;
        }

        this.errorMessage =
          'Unable to load salary periods. Please refresh the page.';

      }

    });

  }

  // Load previously submitted queries
  loadQueries(): void {

    if (!this.auth.getToken()) {
      this.auth.logout();
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.http.get<any>(
      this.queryApi,
      { headers: this.getHeaders() }
    ).subscribe({

      next: response => {

        const records: PaymentQuery[] =
          Array.isArray(response)
            ? response
            : response.queries ||
              response.payment_queries ||
              response.data ||
              [];

        this.queries = records.sort((a, b) =>
          new Date(b.created_at).getTime() -
          new Date(a.created_at).getTime()
        );

        this.loading = false;

      },

      error: error => {

        this.loading = false;

        if (error.status === 401) {
          this.auth.logout();
          return;
        }

        this.errorMessage =
          error.error?.message ||
          'Unable to load payment queries. Please try again.';

      }

    });

  }

  // Submit a new payment query
  submitQuery(): void {

    this.errorMessage = '';
    this.successMessage = '';

    // Validate form
    if (!this.queryType || !this.payPeriod || !this.description.trim()) {

      this.errorMessage =
        'Please complete all required fields.';

      return;
    }

    if (this.description.trim().length < 5) {

      this.errorMessage =
        'Please provide more details about your payment issue.';

      return;
    }

    if (this.description.trim().length > 1000) {

      this.errorMessage =
        'Your description cannot exceed 1000 characters.';

      return;
    }

    if (this.submitting) {
      return;
    }

    if (!this.auth.getToken()) {
      this.auth.logout();
      return;
    }

    // Backend expects subject and message
    const subject = `${this.queryType} - ${this.payPeriod}`;

    const requestBody = {
      subject: subject,
      message: this.description.trim()
    };

    this.submitting = true;

    this.http.post<any>(
      this.queryApi,
      requestBody,
      { headers: this.getHeaders() }
    ).subscribe({

      next: response => {

        this.submitting = false;

        this.successMessage =
          response.message ||
          'Your payment query has been submitted successfully.';

        // Clear form
        this.queryType = '';
        this.payPeriod = '';
        this.description = '';

        // Refresh query history
        this.loadQueries();

      },

      error: error => {

        this.submitting = false;

        if (error.status === 401) {
          this.auth.logout();
          return;
        }

        this.errorMessage =
          error.error?.message ||
          'Unable to submit your query. Please try again.';

      }

    });

  }

  // Format date for query history
  formatDate(date: string): string {

    if (!date) {
      return '—';
    }

    const parsedDate = new Date(date);

    if (isNaN(parsedDate.getTime())) {
      return '—';
    }

    return parsedDate.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });

  }

  // Extract pay period from query subject
  getPayPeriod(subject: string): string {

    if (!subject) {
      return '—';
    }

    const parts = subject.split(' - ');

    return parts.length > 1
      ? parts.slice(1).join(' - ')
      : '—';

  }

  // Extract query type from query subject
  getQueryType(subject: string): string {

    if (!subject) {
      return '—';
    }

    return subject.split(' - ')[0];
  }

  // Get CSS class for query status
  getQueryStatusClass(status: string): string {

    switch (status?.toLowerCase()) {

      case 'resolved':
      case 'closed':
        return 'status-resolved';

      case 'rejected':
        return 'status-rejected';

      case 'in progress':
      case 'processing':
        return 'status-progress';

      default:
        return 'status-pending';

    }

  }

  // Logout
  logout(): void {
    this.auth.logout();
  }

}
