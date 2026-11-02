
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';

import { Auth, Employee } from '../../services/auth';

interface SalaryRecord {
  salary_id?: number;
  employee_id?: number;

  salary_month: number;
  salary_year: number;

  // Earnings
  basic_salary: number;
  house_allowance: number;
  transport_allowance: number;
  overtime: number;
  allowances: number;
  gross_salary: number;

  // Deductions
  income_tax: number;
  provident_fund: number;
  insurance: number;
  other_deductions: number;
  deductions: number;
  total_deductions: number;

  // Final salary and payment information
  net_salary: number;
  payment_date: string | null;
  payment_status: string;
  remarks?: string | null;
}

@Component({
  selector: 'app-salary',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './salary.html',
  styleUrl: './salary.css'
})
export class Salary implements OnInit {

  employee: Employee | null = null;

  salaryRecords: SalaryRecord[] = [];
  selectedIndex = 0;

  loading = false;
  errorMessage = '';

  constructor(
    private http: HttpClient,
    private auth: Auth,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.employee = this.auth.getEmployee();
    this.loadSalaryHistory();
  }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      Authorization: `Bearer ${this.auth.getToken()}`
    });
  }

  loadSalaryHistory(): void {

    if (!this.auth.getToken()) {
      this.auth.logout();
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.http.get<any>(
      'http://127.0.0.1:5000/api/salary/history',
      { headers: this.getHeaders() }
    ).subscribe({

      next: response => {

        this.salaryRecords = (response.salary_history || [])
          .sort((a: SalaryRecord, b: SalaryRecord) =>
            (Number(b.salary_year) * 100 + Number(b.salary_month)) -
            (Number(a.salary_year) * 100 + Number(a.salary_month))
          );

        this.selectedIndex = 0;
        this.loading = false;

        if (this.salaryRecords.length === 0) {
          this.loadCurrentSalary();
        }
      },

      error: error => {

        if (error.status === 401) {
          this.auth.logout();
          return;
        }

        this.loading = false;
        this.loadCurrentSalary();
      }

    });
  }

  loadCurrentSalary(): void {

    this.loading = true;

    this.http.get<any>(
      'http://127.0.0.1:5000/api/salary/details',
      { headers: this.getHeaders() }
    ).subscribe({

      next: response => {

        if (response.salary) {
          this.salaryRecords = [response.salary];
          this.selectedIndex = 0;
        }

        this.loading = false;
      },

      error: error => {

        this.loading = false;

        if (error.status === 401) {
          this.auth.logout();
          return;
        }

        this.errorMessage = 'Unable to load salary details.';
      }

    });
  }

  get selectedSalary(): SalaryRecord | null {
    return this.salaryRecords[this.selectedIndex] || null;
  }

  // Gross salary from the detailed earnings fields
  get grossSalary(): number {

    const salary = this.selectedSalary;

    if (!salary) {
      return 0;
    }

    return Number(salary.basic_salary || 0) +
           Number(salary.house_allowance || 0) +
           Number(salary.transport_allowance || 0) +
           Number(salary.overtime || 0);
  }

  // Total deductions from the detailed deduction fields
  get totalDeductions(): number {

    const salary = this.selectedSalary;

    if (!salary) {
      return 0;
    }

    return Number(salary.income_tax || 0) +
           Number(salary.provident_fund || 0) +
           Number(salary.insurance || 0) +
           Number(salary.other_deductions || 0);
  }

  get monthName(): string {

    const salary = this.selectedSalary;

    if (!salary) {
      return '';
    }

    return new Date(
      Number(salary.salary_year),
      Number(salary.salary_month) - 1
    ).toLocaleString('en-US', { month: 'long' });
  }

  periodLabel(record: SalaryRecord): string {

    const monthName = new Date(
      Number(record.salary_year),
      Number(record.salary_month) - 1
    ).toLocaleString('en-US', { month: 'long' });

    return `${monthName} ${record.salary_year}`;
  }

  onPeriodChange(): void {
    // The selectedIndex is updated by ngModel.
  }

  formatCurrency(value: number): string {
    return Number(value || 0).toLocaleString('en-IN', {
      maximumFractionDigits: 2
    });
  }

  get paymentStatusClass(): string {

    const status = this.selectedSalary?.payment_status?.toLowerCase();

    if (status === 'paid') {
      return 'status-paid';
    }

    if (status === 'rejected' || status === 'failed') {
      return 'status-rejected';
    }

    return 'status-pending';
  }

  navigate(path: string): void {
    this.router.navigate([path]);
  }

  logout(): void {
    this.auth.logout();
  }
}
