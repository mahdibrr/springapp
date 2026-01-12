import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { RouterLink } from '@angular/router';
import { Booking } from '../../core/models/booking.model';
import { BookingService } from '../../core/services/booking.service';
import { NotificationService } from '../../core/services/notification.service';
import { ConfirmDialogComponent } from '../rooms/confirm-dialog.component';

@Component({
  selector: 'app-my-bookings',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    RouterLink
  ],
  template: `
    <div class="page-container">
      <!-- Page Header -->
      <div class="page-header">
        <h1 class="page-title">My Bookings</h1>
        <p class="page-subtitle">View and manage your room reservations</p>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="loading-container">
        <mat-spinner diameter="40"></mat-spinner>
      </div>

      <!-- Empty State -->
      <div *ngIf="!loading && bookings.length === 0" class="empty-state">
        <mat-icon class="empty-state-icon">event_busy</mat-icon>
        <h3 class="empty-state-title">No bookings yet</h3>
        <p class="empty-state-description">You haven't made any room reservations.</p>
        <a mat-raised-button color="primary" routerLink="/rooms" class="mt-4">
          <mat-icon>meeting_room</mat-icon>
          Browse Rooms
        </a>
      </div>

      <!-- Mobile View: Card List -->
      <div *ngIf="!loading && bookings.length > 0 && isMobile" class="bookings-cards">
        <mat-card *ngFor="let booking of bookings" class="booking-card">
          <mat-card-header>
            <mat-card-title>{{ booking.room.name }}</mat-card-title>
            <mat-card-subtitle>
              <mat-icon class="location-icon">location_on</mat-icon>
              {{ booking.room.location }}
            </mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="booking-info">
              <div class="booking-time">
                <mat-icon>schedule</mat-icon>
                <div class="time-details">
                  <span class="date">{{ formatDate(booking.startTime) }}</span>
                  <span class="time">{{ formatTime(booking.startTime) }} - {{ formatTime(booking.endTime) }}</span>
                </div>
              </div>
              <div class="booking-status">
                <span class="status-badge" [ngClass]="getStatusClass(booking.status)">
                  {{ booking.status }}
                </span>
              </div>
            </div>
          </mat-card-content>
          <mat-card-actions align="end">
            <button 
              *ngIf="booking.status === 'PENDING'" 
              mat-button 
              color="warn" 
              (click)="confirmCancel(booking)"
              [disabled]="cancellingBookingId === booking.id">
              <mat-spinner *ngIf="cancellingBookingId === booking.id" diameter="18" class="button-spinner"></mat-spinner>
              <mat-icon *ngIf="cancellingBookingId !== booking.id">cancel</mat-icon>
              {{ cancellingBookingId === booking.id ? 'Cancelling...' : 'Cancel' }}
            </button>
          </mat-card-actions>
        </mat-card>
      </div>

      <!-- Desktop View: Table -->
      <div *ngIf="!loading && bookings.length > 0 && !isMobile" class="table-container">
        <table mat-table [dataSource]="bookings" class="bookings-table">
          <!-- Room Column -->
          <ng-container matColumnDef="room">
            <th mat-header-cell *matHeaderCellDef>Room</th>
            <td mat-cell *matCellDef="let booking">
              <div class="room-cell">
                <span class="room-name">{{ booking.room.name }}</span>
                <span class="room-location">{{ booking.room.location }}</span>
              </div>
            </td>
          </ng-container>

          <!-- Date Column -->
          <ng-container matColumnDef="date">
            <th mat-header-cell *matHeaderCellDef>Date</th>
            <td mat-cell *matCellDef="let booking">
              {{ formatDate(booking.startTime) }}
            </td>
          </ng-container>

          <!-- Time Column -->
          <ng-container matColumnDef="time">
            <th mat-header-cell *matHeaderCellDef>Time</th>
            <td mat-cell *matCellDef="let booking">
              {{ formatTime(booking.startTime) }} - {{ formatTime(booking.endTime) }}
            </td>
          </ng-container>

          <!-- Status Column -->
          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>Status</th>
            <td mat-cell *matCellDef="let booking">
              <span class="status-badge" [ngClass]="getStatusClass(booking.status)">
                {{ booking.status }}
              </span>
            </td>
          </ng-container>

          <!-- Actions Column -->
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Actions</th>
            <td mat-cell *matCellDef="let booking">
              <button 
                *ngIf="booking.status === 'PENDING'" 
                mat-icon-button 
                color="warn" 
                (click)="confirmCancel(booking)"
                [disabled]="cancellingBookingId === booking.id"
                matTooltip="Cancel Booking">
                <mat-spinner *ngIf="cancellingBookingId === booking.id" diameter="20"></mat-spinner>
                <mat-icon *ngIf="cancellingBookingId !== booking.id">cancel</mat-icon>
              </button>
              <span *ngIf="booking.status !== 'PENDING'" class="no-actions">—</span>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .page-container {
      padding: 1.5rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    .page-header {
      margin-bottom: 1.5rem;
    }

    .page-title {
      font-size: 1.5rem;
      font-weight: 600;
      color: var(--sesame-text);
      margin: 0 0 0.25rem 0;
    }

    .page-subtitle {
      font-size: 0.875rem;
      color: var(--sesame-text-light);
      margin: 0;
    }

    /* Card List Styles */
    .bookings-cards {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .booking-card {
      background-color: var(--sesame-surface);
      border-radius: var(--radius-lg);
    }

    .booking-card mat-card-title {
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--sesame-primary);
    }

    .booking-card mat-card-subtitle {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      color: var(--sesame-text-light);
    }

    .location-icon {
      font-size: 1rem;
      width: 1rem;
      height: 1rem;
    }

    .booking-info {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .booking-time {
      display: flex;
      align-items: flex-start;
      gap: 0.5rem;
      color: var(--sesame-text-light);
    }

    .booking-time mat-icon {
      font-size: 1.25rem;
      width: 1.25rem;
      height: 1.25rem;
      color: var(--sesame-secondary);
      margin-top: 0.125rem;
    }

    .time-details {
      display: flex;
      flex-direction: column;
    }

    .time-details .date {
      font-weight: 500;
      color: var(--sesame-text);
    }

    .time-details .time {
      font-size: 0.875rem;
    }

    .booking-status {
      display: flex;
      align-items: center;
    }

    /* Table Styles */
    .table-container {
      background-color: var(--sesame-surface);
      border-radius: var(--radius-lg);
      overflow: hidden;
      box-shadow: var(--shadow-sm);
    }

    .bookings-table {
      width: 100%;
    }

    .bookings-table th {
      background-color: var(--sesame-background);
      font-weight: 600;
      color: var(--sesame-text);
    }

    .bookings-table td {
      padding: 1rem;
    }

    .room-cell {
      display: flex;
      flex-direction: column;
    }

    .room-name {
      font-weight: 500;
      color: var(--sesame-primary);
    }

    .room-location {
      font-size: 0.75rem;
      color: var(--sesame-text-light);
    }

    .no-actions {
      color: var(--sesame-text-muted);
      padding-left: 0.75rem;
    }

    /* Loading & Empty States */
    .loading-container {
      display: flex;
      justify-content: center;
      padding: 3rem;
    }

    .empty-state {
      text-align: center;
      padding: 3rem;
      background-color: var(--sesame-surface);
      border-radius: var(--radius-lg);
    }

    .empty-state-icon {
      font-size: 4rem;
      width: 4rem;
      height: 4rem;
      color: var(--sesame-text-muted);
      opacity: 0.5;
    }

    .empty-state-title {
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--sesame-text);
      margin: 1rem 0 0.5rem;
    }

    .empty-state-description {
      color: var(--sesame-text-light);
      margin: 0;
    }

    .button-spinner {
      display: inline-block;
      margin-right: 4px;
    }
  `]
})
export class MyBookingsComponent implements OnInit {
  bookings: Booking[] = [];
  displayedColumns: string[] = ['room', 'date', 'time', 'status', 'actions'];
  loading = true;
  isMobile = false;
  cancellingBookingId: number | null = null;

  constructor(
    private bookingService: BookingService,
    private notificationService: NotificationService,
    private dialog: MatDialog
  ) {
    this.checkScreenSize();
  }

  @HostListener('window:resize')
  onResize() {
    this.checkScreenSize();
  }

  private checkScreenSize() {
    this.isMobile = window.innerWidth < 768;
  }

  ngOnInit() {
    this.loadBookings();
  }

  loadBookings() {
    this.loading = true;
    this.bookingService.getMyBookings().subscribe({
      next: (data) => {
        this.bookings = data;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.notificationService.error('Failed to load bookings');
        this.loading = false;
      }
    });
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  formatTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getStatusClass(status: string): string {
    return `status-${status.toLowerCase()}`;
  }

  confirmCancel(booking: Booking) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Cancel Booking',
        message: `Are you sure you want to cancel your booking for "${booking.room.name}" on ${this.formatDate(booking.startTime)}?`,
        confirmText: 'Cancel Booking',
        cancelText: 'Keep Booking'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cancelBooking(booking);
      }
    });
  }

  private cancelBooking(booking: Booking) {
    this.cancellingBookingId = booking.id;
    this.bookingService.cancelBooking(booking.id).subscribe({
      next: () => {
        this.cancellingBookingId = null;
        this.notificationService.success('Booking cancelled successfully');
        this.loadBookings();
      },
      error: (err) => {
        this.cancellingBookingId = null;
        console.error(err);
        this.notificationService.error('Failed to cancel booking');
      }
    });
  }
}
