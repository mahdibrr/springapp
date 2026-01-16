import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { SidebarComponent } from './sidebar.component';
import { AuthService } from '../core/services/auth.service';
import { UserService } from '../core/services/user.service';
import { User } from '../core/models/auth.models';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    MatMenuModule,
    MatDividerModule,
    SidebarComponent
  ],
  template: `
    <div class="layout-container">
      <!-- Header -->
      <header class="header">
        <div class="header-left">
          <!-- Mobile menu toggle -->
          <button 
            mat-icon-button 
            class="menu-toggle"
            (click)="toggleSidebar()"
            aria-label="Toggle navigation menu">
            <mat-icon>{{ isSidebarOpen() ? 'close' : 'menu' }}</mat-icon>
          </button>
          
          <!-- Logo -->
          <a routerLink="/dashboard" class="logo-link">
            <img src="Logo-SESAME-png.png" alt="SESAME Logo" class="logo-image" />
          </a>
        </div>

        <!-- Center Title -->
        <div class="header-center">
          <span class="center-title">Room Reservation</span>
        </div>

        <div class="header-right">
          <!-- User info -->
          <div class="user-info" *ngIf="currentUser()">
            <button mat-button [matMenuTriggerFor]="userMenu" class="user-menu-trigger">
              <span class="profile-link">Profile</span>
              <mat-icon>arrow_drop_down</mat-icon>
            </button>
            <mat-menu #userMenu="matMenu">
              <div class="user-menu-header">
                <div class="user-menu-name">{{ currentUser()?.firstname }} {{ currentUser()?.lastname }}</div>
                <div class="user-menu-email">{{ currentUser()?.email }}</div>
                <div class="user-menu-role">
                  <span class="role-badge" [class.admin]="currentUser()?.role === 'ADMIN'">
                    {{ currentUser()?.role }}
                  </span>
                </div>
              </div>
              <mat-divider></mat-divider>
              <button mat-menu-item (click)="logout()">
                <mat-icon>logout</mat-icon>
                <span>Logout</span>
              </button>
            </mat-menu>
          </div>
        </div>
      </header>

      <!-- Main content area with sidebar -->
      <div class="main-wrapper">
        <!-- Sidebar overlay for mobile -->
        <div 
          class="sidebar-overlay" 
          [class.visible]="isSidebarOpen()"
          (click)="closeSidebar()">
        </div>

        <!-- Sidebar -->
        <aside class="sidebar" [class.open]="isSidebarOpen()">
          <app-sidebar 
            [isOpen]="isSidebarOpen()" 
            [currentUser]="currentUser()"
            (menuItemClicked)="onMenuItemClicked()">
          </app-sidebar>
        </aside>

        <!-- Main content -->
        <main class="main-content">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .layout-container {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      background-color: var(--sesame-background);
    }

    /* Header Styles */
    .header {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      height: var(--header-height);
      background-color: white;
      color: black;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 1rem;
      z-index: 1000;
      border-bottom: 1px solid #e5e7eb;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex: 1;
    }

    .header-center {
      display: flex;
      align-items: center;
      justify-content: center;
      flex: 1;
    }

    .center-title {
      font-size: 1.25rem;
      font-weight: 600;
      white-space: nowrap;
    }

    .menu-toggle {
      color: black;
    }

    .logo-link {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      text-decoration: none;
      color: black;
    }

    .logo-image {
      height: 50px;
      width: auto;
    }

    .header-right {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      flex: 1;
    }

    /* User Menu Styles */
    .user-menu-trigger {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: black;
    }

    .user-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background-color: var(--sesame-secondary);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 0.875rem;
    }

    .profile-link {
      font-weight: 500;
      font-size: 0.875rem;
    }

    .user-name {
      display: none;
    }

    .user-menu-header {
      padding: 1rem;
      border-bottom: 1px solid #e5e7eb;
    }

    .user-menu-name {
      font-weight: 600;
      color: var(--sesame-text);
    }

    .user-menu-email {
      font-size: 0.875rem;
      color: var(--sesame-text-light);
      margin-top: 0.25rem;
    }

    .user-menu-role {
      margin-top: 0.5rem;
    }

    .role-badge {
      display: inline-block;
      padding: 0.125rem 0.5rem;
      border-radius: var(--radius-full);
      font-size: 0.75rem;
      font-weight: 600;
      background-color: var(--sesame-background);
      color: var(--sesame-text-light);
    }

    .role-badge.admin {
      background-color: var(--sesame-secondary);
      color: white;
    }

    /* Main Wrapper */
    .main-wrapper {
      display: flex;
      flex: 1;
      margin-top: var(--header-height);
      position: relative;
    }

    /* Sidebar Overlay (mobile) */
    .sidebar-overlay {
      display: none;
      position: fixed;
      top: var(--header-height);
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      z-index: 899;
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .sidebar-overlay.visible {
      display: block;
      opacity: 1;
    }

    /* Sidebar */
    .sidebar {
      position: fixed;
      top: var(--header-height);
      left: 0;
      bottom: 0;
      width: var(--sidebar-width);
      background-color: var(--sesame-surface);
      border-right: 1px solid #e5e7eb;
      transform: translateX(-100%);
      transition: transform 0.3s ease;
      z-index: 900;
      overflow-y: auto;
    }

    .sidebar.open {
      transform: translateX(0);
    }

    /* Main Content */
    .main-content {
      flex: 1;
      padding: 1.5rem;
      min-height: calc(100vh - var(--header-height));
      width: 100%;
      overflow-y: auto;
      position: relative;
      z-index: 1;
    }

    /* Desktop Styles */
    @media (min-width: 768px) {
      .menu-toggle {
        display: none;
      }

      .profile-link {
        display: inline;
      }

      .sidebar-overlay {
        display: none !important;
      }

      .sidebar {
        transform: translateX(0);
      }

      .main-content {
        margin-left: var(--sidebar-width);
        width: calc(100% - var(--sidebar-width));
      }
    }

    /* Large Desktop */
    @media (min-width: 1024px) {
      .center-title {
        font-size: 1.375rem;
      }

      .main-content {
        padding: 2rem;
      }
    }
  `]
})
export class LayoutComponent implements OnInit {
  private authService = inject(AuthService);
  private userService = inject(UserService);

  isSidebarOpen = signal(false);
  currentUser = signal<User | null>(null);

  ngOnInit(): void {
    this.loadCurrentUser();
  }

  private loadCurrentUser(): void {
    this.userService.getCurrentUser().subscribe({
      next: (user) => {
        this.currentUser.set(user);
      },
      error: (err) => {
        console.error('Failed to load user:', err);
      }
    });
  }

  toggleSidebar(): void {
    this.isSidebarOpen.update(value => !value);
  }

  closeSidebar(): void {
    this.isSidebarOpen.set(false);
  }

  onMenuItemClicked(): void {
    // Close sidebar on mobile when menu item is clicked
    if (window.innerWidth < 768) {
      this.closeSidebar();
    }
  }

  getUserInitials(): string {
    const user = this.currentUser();
    if (!user) return '';
    const first = user.firstname?.charAt(0) || '';
    const last = user.lastname?.charAt(0) || '';
    return (first + last).toUpperCase();
  }

  logout(): void {
    this.userService.clearUser();
    this.authService.logout();
  }
}
