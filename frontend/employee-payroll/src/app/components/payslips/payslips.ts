
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { RouterModule } from '@angular/router';

import { Auth, Employee } from '../../services/auth';

interface PayslipRecord {
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

  // Payment details
  net_salary: number;
  payment_status: string;
  payment_date?: string | null;
  remarks?: string | null;
}

@Component({
  selector: 'app-payslips',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './payslips.html',
  styleUrl: './payslips.css'
})
export class Payslips implements OnInit {

  employee: Employee | null = null;
  payslips: PayslipRecord[] = [];

  selectedPayslip: PayslipRecord | null = null;

  loading = false;
  errorMessage = '';

  constructor(
    private http: HttpClient,
    private auth: Auth
  ) {}

  ngOnInit(): void {
    this.employee = this.auth.getEmployee();
    this.loadPayslips();
  }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      Authorization: `Bearer ${this.auth.getToken()}`
    });
  }

  loadPayslips(): void {

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

        const records: PayslipRecord[] = Array.isArray(response)
          ? response
          : response.salary_history ||
            response.salaries ||
            response.records ||
            response.data ||
            [];

        this.payslips = records
          .filter(record =>
            record.payment_status?.toLowerCase() === 'paid'
          )
          .sort((a, b) =>
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

        this.errorMessage = 'Unable to load your payslips.';
      }

    });
  }

  periodLabel(record: PayslipRecord): string {

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

  // Calculate gross salary from individual earnings
  getGrossSalary(record: PayslipRecord): number {

    return Number(record.basic_salary || 0) +
      Number(record.house_allowance || 0) +
      Number(record.transport_allowance || 0) +
      Number(record.overtime || 0);
  }

  // Calculate total deductions from individual components
  getTotalDeductions(record: PayslipRecord): number {

    return Number(record.income_tax || 0) +
      Number(record.provident_fund || 0) +
      Number(record.insurance || 0) +
      Number(record.other_deductions || 0);
  }

  viewPayslip(record: PayslipRecord): void {
    this.selectedPayslip = record;
  }

  closePayslip(): void {
    this.selectedPayslip = null;
  }

  downloadPayslip(record: PayslipRecord): void {

    this.selectedPayslip = record;

    setTimeout(() => {
      window.print();
    }, 100);
  }

  logout(): void {
    this.auth.logout();
  }

}
