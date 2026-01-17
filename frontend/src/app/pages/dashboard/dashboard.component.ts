import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';
import { environment } from '../../../environments/environment';

interface RecentBooking {
  id: number;
  roomName: string;
  startTime: string;
  endTime: string;
  status: string;
}

interface UserDashboardStats {
  totalRooms: number;
  myBookingsCount: number;
  myPendingCount: number;
  recentBookings: RecentBooking[];
  totalUsers?: number;
  allPendingCount?: number;
  isAdmin: boolean;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatProgressSpinnerModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1 class="page-title">Dashboard</h1>
        <p class="page-subtitle">Welcome back! Here's an overview of your reservations.</p>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="loading-container">
        <mat-spinner diameter="40"></mat-spinner>
      </div>

      <div *ngIf="!loading">
        <!-- Stats Cards -->
        <div class="stats-grid">
        <!-- Total Rooms Card -->
        <div class="stats-card">
          <div class="stats-card-icon bg-primary-light">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
          </div>
          <div class="stats-card-value">{{ stats?.totalRooms || 0 }}</div>
          <div class="stats-card-label">Available Rooms</div>
        </div>

        <!-- My Bookings Card -->
        <div class="stats-card">
          <div class="stats-card-icon bg-secondary">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          </div>
          <div class="stats-card-value">{{ stats?.myBookingsCount || 0 }}</div>
          <div class="stats-card-label">My Bookings</div>
        </div>

        <!-- Pending Bookings Card -->
        <div class="stats-card">
          <div class="stats-card-icon" style="background-color: var(--status-pending);">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </div>
          <div class="stats-card-value">{{ stats?.myPendingCount || 0 }}</div>
          <div class="stats-card-label">Pending Requests</div>
        </div>
      </div>

      <!-- Admin Stats Section -->
      <div *ngIf="stats?.isAdmin" class="admin-section">
        <h2 class="section-title">Admin Statistics</h2>
        <div class="stats-grid">
          <!-- Total Users Card -->
          <div class="stats-card admin-card">
            <div class="stats-card-icon bg-primary">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <div class="stats-card-value">{{ stats?.totalUsers || 0 }}</div>
            <div class="stats-card-label">Total Users</div>
          </div>

          <!-- All Pending Bookings Card -->
          <div class="stats-card admin-card">
            <div class="stats-card-icon" style="background-color: var(--status-rejected);">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="12" y1="18" x2="12" y2="12"></line>
                <line x1="9" y1="15" x2="15" y2="15"></line>
              </svg>
            </div>
            <div class="stats-card-value">{{ stats?.allPendingCount || 0 }}</div>
            <div class="stats-card-label">All Pending Requests</div>
          </div>
        </div>
      </div>

      <!-- Recent Bookings Section -->
      <div class="recent-bookings-section">
        <h2 class="section-title">Recent Bookings</h2>
        
        <div *ngIf="stats?.recentBookings?.length === 0" class="empty-state">
          <div class="empty-state-icon">📅</div>
          <div class="empty-state-title">No bookings yet</div>
          <div class="empty-state-description">Your recent bookings will appear here.</div>
        </div>

        <div *ngIf="stats?.recentBookings?.length" class="bookings-list">
          <div *ngFor="let booking of stats?.recentBookings" class="booking-item">
            <div class="booking-info">
              <div class="booking-room">{{ booking.roomName }}</div>
              <div class="booking-time">{{ formatDateTime(booking.startTime) }} - {{ formatTime(booking.endTime) }}</div>
            </div>
            <span class="status-badge" [ngClass]="getStatusClass(booking.status)">
              {{ booking.status }}
            </span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(1, 1fr);
      gap: 1rem;
      margin-bottom: 2rem;
    }

    @media (min-width: 768px) {
      .stats-grid {
        grid-template-columns: repeat(3, 1fr);
      }
    }

    .stats-card {
      background-color: var(--sesame-surface);
      border-radius: var(--radius-lg);
      padding: 1.5rem;
      box-shadow: var(--shadow-sm);
      transition: box-shadow 0.2s ease-in-out, transform 0.2s ease-in-out;
    }

    .stats-card:hover {
      box-shadow: var(--shadow-md);
      transform: translateY(-2px);
    }

    .stats-card-icon {
      width: 48px;
      height: 48px;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1rem;
    }

    .stats-card-value {
      font-size: 2rem;
      font-weight: 700;
      color: var(--sesame-text);
      line-height: 1;
    }

    .stats-card-label {
      font-size: 0.875rem;
      color: var(--sesame-text-light);
      margin-top: 0.25rem;
    }

    .admin-section {
      margin-top: 2rem;
      padding-top: 2rem;
      border-top: 1px solid #e5e7eb;
    }

    .admin-card {
      border-left: 4px solid var(--sesame-primary);
    }

    .section-title {
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--sesame-text);
      margin: 0 0 1rem 0;
    }

    .recent-bookings-section {
      margin-top: 2rem;
    }

    .bookings-list {
      background-color: var(--sesame-surface);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
      overflow: hidden;
    }

    .booking-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1.5rem;
      border-bottom: 1px solid #e5e7eb;
      transition: background-color 0.2s ease-in-out;
    }

    .booking-item:last-child {
      border-bottom: none;
    }

    .booking-item:hover {
      background-color: var(--sesame-surface-hover);
    }

    .booking-info {
      flex: 1;
    }

    .booking-room {
      font-weight: 600;
      color: var(--sesame-text);
      margin-bottom: 0.25rem;
    }

    .booking-time {
      font-size: 0.875rem;
      color: var(--sesame-text-light);
    }

    .loading-container {
      display: flex;
      justify-content: center;
      padding: 3rem;
    }
  `]
})
export class DashboardComponent implements OnInit {
  stats: UserDashboardStats | null = null;
  loading = true;

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    this.loading = true;
    this.http.get<UserDashboardStats>(`${environment.apiUrl}/dashboard/user-stats`)
      .subscribe({
        next: (data) => {
          this.stats = data;
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Failed to load stats', err);
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
  }

  formatDateTime(dateTimeStr: string): string {
    const date = new Date(dateTimeStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatTime(dateTimeStr: string): string {
    const date = new Date(dateTimeStr);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'PENDING': return 'status-pending';
      case 'APPROVED': return 'status-approved';
      case 'REJECTED': return 'status-rejected';
      case 'CANCELLED': return 'status-cancelled';
      default: return '';
    }
  }
}
