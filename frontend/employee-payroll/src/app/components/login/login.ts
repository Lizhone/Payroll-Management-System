
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { Auth } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {

  email = '';
  password = '';

  showPassword = false;
  rememberMe = false;
  loading = false;
  errorMessage = '';

  constructor(
    private auth: Auth,
    private router: Router
  ) {}

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  onLogin(): void {

    this.errorMessage = '';

    if (!this.email.trim() || !this.password) {
      this.errorMessage = 'Please enter your employee ID/email and password.';
      return;
    }

    this.loading = true;

    this.auth.login(
      this.email.trim(),
      this.password
    ).subscribe({

      next: () => {
        this.loading = false;
        this.router.navigate(['/dashboard']);
      },

      error: (error) => {
        this.loading = false;

        this.errorMessage =
          error.error?.message ||
          'Invalid login credentials. Please try again.';
      }

    });
  }
}
