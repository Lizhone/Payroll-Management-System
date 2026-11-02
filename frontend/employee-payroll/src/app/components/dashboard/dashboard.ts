
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Auth, Employee } from '../../services/auth';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {

  employee: Employee | null = null;

  attendance = {
    Present: 0,
    Absent: 0,
    Leave: 0
  };

  salary = 0;
  paidCount = 0;
  pendingCount = 0;

  loading = true;
  errorMessage = '';

  constructor(
    private http: HttpClient,
    private auth: Auth,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.employee = this.auth.getEmployee();
    this.loadDashboard();
  }

  loadDashboard(): void {

    const token = this.auth.getToken();

    if (!token) {
      this.auth.logout();
      return;
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    let completedRequests = 0;

    const finishRequest = () => {
      completedRequests++;

      if (completedRequests === 4) {
        this.loading = false;
      }
    };

    this.http.get<any>(
      'http://127.0.0.1:5000/api/auth/profile',
      { headers }
    ).subscribe({
      next: response => {
        this.employee = response.employee || this.employee;
        finishRequest();
      },
      error: () => finishRequest()
    });

    this.http.get<any>(
      'http://127.0.0.1:5000/api/attendance/summary',
      { headers }
    ).subscribe({
      next: response => {
        if (response.summary) {
          this.attendance = {
            Present: Number(response.summary.Present || 0),
            Absent: Number(response.summary.Absent || 0),
            Leave: Number(response.summary.Leave || 0)
          };
        }
        finishRequest();
      },
      error: () => finishRequest()
    });

    this.http.get<any>(
      'http://127.0.0.1:5000/api/salary/details',
      { headers }
    ).subscribe({
      next: response => {
        this.salary = Number(
          response.salary?.net_salary || 0
        );
        finishRequest();
      },
      error: () => finishRequest()
    });

    this.http.get<any>(
      'http://127.0.0.1:5000/api/salary/payment-status',
      { headers }
    ).subscribe({
      next: response => {

        const payments = response.payments || [];

        this.paidCount = payments.filter(
          (p: any) => p.payment_status === 'Paid'
        ).length;

        this.pendingCount = payments.filter(
          (p: any) => p.payment_status === 'Pending'
        ).length;

        finishRequest();
      },
      error: () => finishRequest()
    });
  }

  navigate(path: string): void {
    this.router.navigate([path]);
  }

  logout(): void {
    this.auth.logout();
  }
}
