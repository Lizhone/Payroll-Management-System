
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

export interface Employee {
  employee_id: number;
  employee_code: string;
  full_name: string;
  email: string;
  department: string;
  designation: string;
}

export interface LoginResponse {
  status: string;
  message: string;
  access_token: string;
  employee: Employee;
}

@Injectable({
  providedIn: 'root'
})
export class Auth {

  private apiUrl = 'http://127.0.0.1:5000/api/auth';

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  login(email: string, password: string): Observable<LoginResponse> {

    return this.http.post<LoginResponse>(
      `${this.apiUrl}/login`,
      { email, password }
    ).pipe(
      tap(response => {
        localStorage.setItem('access_token', response.access_token);

        localStorage.setItem(
          'employee',
          JSON.stringify(response.employee)
        );
      })
    );
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  getEmployee(): Employee | null {

    const employee = localStorage.getItem('employee');

    return employee ? JSON.parse(employee) as Employee : null;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  logout(): void {

    localStorage.removeItem('access_token');
    localStorage.removeItem('employee');

    this.router.navigate(['/login']);
  }
}
