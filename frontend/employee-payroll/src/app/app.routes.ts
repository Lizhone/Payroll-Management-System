
import { Routes } from '@angular/router';

import { Login } from './components/login/login';
import { Dashboard } from './components/dashboard/dashboard';
import { Attendance } from './components/attendance/attendance';
import { Salary } from './components/salary/salary';
import { Payslips } from './components/payslips/payslips';
import { PaymentStatus } from './components/payment-status/payment-status';
import { PaymentQueries } from './components/payment-queries/payment-queries';

export const routes: Routes = [

  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },

  {
    path: 'login',
    component: Login
  },

  {
    path: 'dashboard',
    component: Dashboard
  },

  {
    path: 'attendance',
    component: Attendance
  },

  {
    path: 'salary',
    component: Salary
  },

  {
  path: 'payslips',
  component: Payslips
},

  {
    path: 'payment-status',
    component: PaymentStatus
  },

  {
    path: 'payment-queries',
    component: PaymentQueries
  },

  {
    path: '**',
    redirectTo: 'login'
  }

];
