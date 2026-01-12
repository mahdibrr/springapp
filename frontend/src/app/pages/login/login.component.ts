import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    RouterLink
  ],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <!-- Logo Section -->
        <div class="auth-logo-section">
          <img src="Logo-SESAME-png.png" alt="SESAME Logo" class="auth-logo">
          <h1 class="auth-title">Room Reservation</h1>
          <p class="auth-subtitle">Sign in to manage your bookings</p>
        </div>

        <!-- Form Section -->
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="auth-form">
          <mat-form-field appearance="outline" class="auth-field">
            <mat-label>Email</mat-label>
            <mat-icon matPrefix>email</mat-icon>
            <input matInput formControlName="email" type="email" placeholder="Enter your email">
            <mat-error *ngIf="loginForm.get('email')?.hasError('required')">Email is required</mat-error>
            <mat-error *ngIf="loginForm.get('email')?.hasError('email')">Please enter a valid email</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="auth-field">
            <mat-label>Password</mat-label>
            <mat-icon matPrefix>lock</mat-icon>
            <input matInput formControlName="password" [type]="hidePassword ? 'password' : 'text'" placeholder="Enter your password">
            <button mat-icon-button matSuffix (click)="hidePassword = !hidePassword" type="button">
              <mat-icon>{{hidePassword ? 'visibility_off' : 'visibility'}}</mat-icon>
            </button>
            <mat-error *ngIf="loginForm.get('password')?.hasError('required')">Password is required</mat-error>
          </mat-form-field>

          <button mat-raised-button color="primary" type="submit" class="auth-submit-btn" [disabled]="loginForm.invalid || isLoading">
            <mat-spinner *ngIf="isLoading" diameter="20" class="inline-spinner"></mat-spinner>
            <span *ngIf="!isLoading">Sign In</span>
          </button>

          <div class="auth-footer">
            <span class="auth-footer-text">Don't have an account?</span>
            <a routerLink="/register" class="auth-link">Create one</a>
          </div>
        </form>
      </div>

      <!-- Decorative Background -->
      <div class="auth-background">
        <div class="auth-bg-shape auth-bg-shape-1"></div>
        <div class="auth-bg-shape auth-bg-shape-2"></div>
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, var(--sesame-primary) 0%, var(--sesame-primary-dark) 100%);
      padding: 1rem;
      position: relative;
      overflow: hidden;
    }

    .auth-card {
      background: var(--sesame-surface);
      border-radius: var(--radius-xl);
      box-shadow: var(--shadow-xl);
      padding: 2.5rem;
      width: 100%;
      max-width: 420px;
      position: relative;
      z-index: 10;
    }

    .auth-logo-section {
      text-align: center;
      margin-bottom: 2rem;
    }

    .auth-logo {
      height: 60px;
      width: auto;
      margin-bottom: 1rem;
    }

    .auth-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--sesame-primary);
      margin: 0 0 0.5rem 0;
    }

    .auth-subtitle {
      font-size: 0.875rem;
      color: var(--sesame-text-light);
      margin: 0;
    }

    .auth-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .auth-field {
      width: 100%;
    }

    .auth-field mat-icon[matPrefix] {
      color: var(--sesame-text-muted);
      margin-right: 0.5rem;
    }

    .auth-submit-btn {
      height: 48px;
      font-size: 1rem;
      font-weight: 600;
      margin-top: 0.5rem;
      background-color: var(--sesame-primary) !important;
      color: white !important;
    }

    .auth-submit-btn:hover:not(:disabled) {
      background-color: var(--sesame-primary-dark) !important;
    }

    .auth-submit-btn:disabled {
      opacity: 0.7;
    }

    .inline-spinner {
      display: inline-block;
    }

    ::ng-deep .inline-spinner circle {
      stroke: white !important;
    }

    .auth-footer {
      text-align: center;
      margin-top: 1.5rem;
      padding-top: 1.5rem;
      border-top: 1px solid #e5e7eb;
    }

    .auth-footer-text {
      color: var(--sesame-text-light);
      font-size: 0.875rem;
    }

    .auth-link {
      color: var(--sesame-primary);
      font-weight: 600;
      text-decoration: none;
      margin-left: 0.25rem;
      transition: color 0.2s ease;
    }

    .auth-link:hover {
      color: var(--sesame-secondary);
      text-decoration: underline;
    }

    /* Decorative Background Shapes */
    .auth-background {
      position: absolute;
      inset: 0;
      overflow: hidden;
      pointer-events: none;
    }

    .auth-bg-shape {
      position: absolute;
      border-radius: 50%;
      opacity: 0.1;
    }

    .auth-bg-shape-1 {
      width: 400px;
      height: 400px;
      background: var(--sesame-secondary);
      top: -100px;
      right: -100px;
    }

    .auth-bg-shape-2 {
      width: 300px;
      height: 300px;
      background: white;
      bottom: -50px;
      left: -50px;
    }

    /* Responsive Styles */
    @media (max-width: 480px) {
      .auth-card {
        padding: 1.5rem;
        margin: 0.5rem;
      }

      .auth-logo {
        height: 50px;
      }

      .auth-title {
        font-size: 1.25rem;
      }
    }

    @media (min-width: 768px) {
      .auth-card {
        padding: 3rem;
      }

      .auth-logo {
        height: 70px;
      }
    }
  `]
})
export class LoginComponent {
  loginForm: FormGroup;
  hidePassword = true;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.authService.login(this.loginForm.value).subscribe({
        next: () => {
          this.isLoading = false;
          this.notificationService.success('Welcome back!');
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          this.isLoading = false;
          this.notificationService.error(err.error?.error || 'Login failed. Please check your credentials.');
        }
      });
    }
  }
}
