import { Component, signal, inject } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from './core/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, MatToolbarModule, MatButtonModule],
  template: `
    <mat-toolbar color="primary" class="justify-between">
      <span>Room Reservation</span>
      <div *ngIf="isLoggedIn$ | async; else loginLinks">
        <a mat-button routerLink="/dashboard">Dashboard</a>
        <a mat-button routerLink="/rooms">Rooms</a>
        <button mat-button (click)="logout()">Logout</button>
      </div>
      <ng-template #loginLinks>
        <a mat-button routerLink="/login">Login</a>
        <a mat-button routerLink="/register">Register</a>
      </ng-template>
    </mat-toolbar>
    <router-outlet></router-outlet>
  `,
  styleUrl: './app.css'
})
export class App {
  authService = inject(AuthService);
  isLoggedIn$ = this.authService.isAuthenticated$;

  logout() {
    this.authService.logout();
  }
}
