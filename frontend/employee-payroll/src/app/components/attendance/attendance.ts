
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';

import { Auth, Employee } from '../../services/auth';

interface AttendanceRecord {
  attendance_id?: number;
  attendance_date: string;
  check_in: string | null;
  check_out: string | null;
  status: string;
  remarks: string | null;
}

interface CalendarDay {
  date: number;
  fullDate: string;
  status: string;
  isCurrentMonth: boolean;
  isToday: boolean;
}

@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './attendance.html',
  styleUrl: './attendance.css'
})
export class Attendance implements OnInit {

  employee: Employee | null = null;

  attendanceRecords: AttendanceRecord[] = [];
  calendarDays: CalendarDay[] = [];

  selectedMonth = new Date().getMonth();
  selectedYear = new Date().getFullYear();

  loading = false;
  errorMessage = '';

  showAllRecords = false;
  issueFormOpen = false;

  readonly today = new Date();

  constructor(
    private http: HttpClient,
    private auth: Auth,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.employee = this.auth.getEmployee();
    this.loadAttendance();
  }

  get monthName(): string {
    return new Date(
      this.selectedYear,
      this.selectedMonth
    ).toLocaleString('en-US', { month: 'long' });
  }

  get presentDays(): number {
    return this.attendanceRecords.filter(
      record => record.status?.toLowerCase() === 'present'
    ).length;
  }

  get leaveDays(): number {
    return this.attendanceRecords.filter(
      record => record.status?.toLowerCase() === 'leave'
    ).length;
  }

  get absentDays(): number {
    return this.attendanceRecords.filter(
      record => record.status?.toLowerCase() === 'absent'
    ).length;
  }

  // Holiday records are not currently provided by the backend.
  get holidayDays(): number {
    return this.attendanceRecords.filter(
      record => record.status?.toLowerCase() === 'holiday'
    ).length;
  }

  get recentRecords(): AttendanceRecord[] {
    const sorted = [...this.attendanceRecords].sort(
      (a, b) => b.attendance_date.localeCompare(a.attendance_date)
    );

    return this.showAllRecords ? sorted : sorted.slice(0, 2);
  }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      Authorization: `Bearer ${this.auth.getToken()}`
    });
  }

  loadAttendance(): void {

    if (!this.auth.getToken()) {
      this.auth.logout();
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const month = this.selectedMonth + 1;

    this.http.get<any>(
      `http://127.0.0.1:5000/api/attendance/monthly?year=${this.selectedYear}&month=${month}`,
      { headers: this.getHeaders() }
    ).subscribe({

      next: response => {
        this.attendanceRecords = response.attendance || [];
        this.buildCalendar();
        this.loading = false;
      },

      error: error => {
        this.loading = false;

        if (error.status === 401) {
          this.auth.logout();
          return;
        }

        this.errorMessage = 'Unable to load attendance records.';
        this.attendanceRecords = [];
        this.buildCalendar();
      }

    });
  }

  buildCalendar(): void {

    const firstDay = new Date(
      this.selectedYear,
      this.selectedMonth,
      1
    ).getDay();

    const daysInMonth = new Date(
      this.selectedYear,
      this.selectedMonth + 1,
      0
    ).getDate();

    const previousMonthDays = new Date(
      this.selectedYear,
      this.selectedMonth,
      0
    ).getDate();

    const recordsMap = new Map<string, string>();

    this.attendanceRecords.forEach(record => {
      recordsMap.set(
        record.attendance_date.substring(0, 10),
        record.status
      );
    });

    const days: CalendarDay[] = [];

    // Days from previous month
    for (let i = firstDay - 1; i >= 0; i--) {
      const date = previousMonthDays - i;

      days.push({
        date,
        fullDate: '',
        status: '',
        isCurrentMonth: false,
        isToday: false
      });
    }

    // Current month
    for (let date = 1; date <= daysInMonth; date++) {

      const fullDate = [
        this.selectedYear,
        String(this.selectedMonth + 1).padStart(2, '0'),
        String(date).padStart(2, '0')
      ].join('-');

      const status = recordsMap.get(fullDate) || '';

      const isToday =
        this.today.getFullYear() === this.selectedYear &&
        this.today.getMonth() === this.selectedMonth &&
        this.today.getDate() === date;

      days.push({
        date,
        fullDate,
        status,
        isCurrentMonth: true,
        isToday
      });
    }

    // Fill final calendar row
    while (days.length % 7 !== 0) {
      const nextDate = days.length - firstDay - daysInMonth + 1;

      days.push({
        date: nextDate,
        fullDate: '',
        status: '',
        isCurrentMonth: false,
        isToday: false
      });
    }

    this.calendarDays = days;
  }

  previousMonth(): void {
    this.selectedMonth--;

    if (this.selectedMonth < 0) {
      this.selectedMonth = 11;
      this.selectedYear--;
    }

    this.showAllRecords = false;
    this.loadAttendance();
  }

  nextMonth(): void {
    this.selectedMonth++;

    if (this.selectedMonth > 11) {
      this.selectedMonth = 0;
      this.selectedYear++;
    }

    this.showAllRecords = false;
    this.loadAttendance();
  }

  getStatusClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'present':
        return 'day-present';
      case 'absent':
        return 'day-absent';
      case 'leave':
        return 'day-leave';
      case 'holiday':
        return 'day-holiday';
      default:
        return '';
    }
  }

  statusClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'present':
        return 'status-present';
      case 'absent':
        return 'status-absent';
      case 'leave':
        return 'status-leave';
      case 'holiday':
        return 'status-holiday';
      default:
        return 'status-default';
    }
  }

  toggleRecords(): void {
    this.showAllRecords = !this.showAllRecords;
  }

  toggleIssueForm(): void {
    this.issueFormOpen = !this.issueFormOpen;
  }

  navigate(path: string): void {
    this.router.navigate([path]);
  }

  logout(): void {
    this.auth.logout();
  }
}
