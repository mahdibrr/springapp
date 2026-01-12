import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { User } from '../core/models/auth.models';

export interface MenuItem {
  label: string;
  icon: string;
  route: string;
  adminOnly: boolean;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    MatListModule,
    MatIconModule,
    MatDividerModule
  ],
  template: `
    <nav class="sidebar-nav">
      <!-- Main Navigation -->
      <div class="nav-section">
        <div class="nav-section-title">Main</div>
        <mat-nav-list>
          <ng-container *ngFor="let item of getFilteredMenuItems()">
            <a 
              mat-list-item 
              [routerLink]="item.route"
              routerLinkActive="active"
              [routerLinkActiveOptions]="{ exact: item.route === '/dashboard' }"
              (click)="onItemClick()"
              class="nav-item">
              <mat-icon matListItemIcon>{{ item.icon }}</mat-icon>
              <span matListItemTitle>{{ item.label }}</span>
            </a>
          </ng-container>
        </mat-nav-list>
      </div>

      <!-- Admin Section -->
      <div class="nav-section" *ngIf="isAdmin()">
        <mat-divider></mat-divider>
        <div class="nav-section-title">Administration</div>
        <mat-nav-list>
          <ng-container *ngFor="let item of adminMenuItems">
            <a 
              mat-list-item 
              [routerLink]="item.route"
              routerLinkActive="active"
              (click)="onItemClick()"
              class="nav-item">
              <mat-icon matListItemIcon>{{ item.icon }}</mat-icon>
              <span matListItemTitle>{{ item.label }}</span>
            </a>
          </ng-container>
        </mat-nav-list>
      </div>

      <!-- Footer -->
      <div class="sidebar-footer">
        <mat-divider></mat-divider>
        <div class="footer-content">
          <span class="version-text">SESAME Room Reservation</span>
          <span class="version-number">v1.0.0</span>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .sidebar-nav {
      display: flex;
      flex-direction: column;
      height: 100%;
      padding: 1rem 0;
    }

    .nav-section {
      margin-bottom: 0.5rem;
    }

    .nav-section-title {
      padding: 0.5rem 1rem;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--sesame-text-muted);
    }

    .nav-item {
      margin: 0.25rem 0.5rem;
      border-radius: var(--radius-md) !important;
      transition: all 0.2s ease;
    }

    .nav-item:hover {
      background-color: var(--sesame-surface-hover) !important;
    }

    .nav-item.active {
      background-color: rgba(0, 71, 143, 0.1) !important;
      color: var(--sesame-primary) !important;
    }

    .nav-item.active mat-icon {
      color: var(--sesame-primary);
    }

    ::ng-deep .nav-item .mdc-list-item__primary-text {
      font-weight: 500;
    }

    ::ng-deep .nav-item.active .mdc-list-item__primary-text {
      font-weight: 600;
      color: var(--sesame-primary);
    }

    mat-icon {
      color: var(--sesame-text-light);
    }

    mat-divider {
      margin: 0.5rem 1rem;
    }

    .sidebar-footer {
      margin-top: auto;
      padding-top: 1rem;
    }

    .footer-content {
      padding: 1rem;
      text-align: center;
    }

    .version-text {
      display: block;
      font-size: 0.75rem;
      color: var(--sesame-text-muted);
    }

    .version-number {
      display: block;
      font-size: 0.625rem;
      color: var(--sesame-text-muted);
      margin-top: 0.25rem;
    }
  `]
})
export class SidebarComponent {
  @Input() isOpen: boolean = false;
  @Input() currentUser: User | null = null;
  @Output() menuItemClicked = new EventEmitter<void>();

  // Main menu items (visible to all authenticated users)
  mainMenuItems: MenuItem[] = [
    { label: 'Dashboard', icon: 'dashboard', route: '/dashboard', adminOnly: false },
    { label: 'Rooms', icon: 'meeting_room', route: '/rooms', adminOnly: false },
    { label: 'My Bookings', icon: 'event', route: '/my-bookings', adminOnly: false }
  ];

  // Admin-only menu items
  adminMenuItems: MenuItem[] = [
    { label: 'Manage Bookings', icon: 'pending_actions', route: '/admin/bookings', adminOnly: true },
    { label: 'Add Room', icon: 'add_business', route: '/rooms/add', adminOnly: true }
  ];

  getFilteredMenuItems(): MenuItem[] {
    return this.mainMenuItems.filter(item => !item.adminOnly || this.isAdmin());
  }

  isAdmin(): boolean {
    return this.currentUser?.role === 'ADMIN';
  }

  onItemClick(): void {
    this.menuItemClicked.emit();
  }
}
