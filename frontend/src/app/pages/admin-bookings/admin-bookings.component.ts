import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Booking } from '../../core/models/booking.model';
import { BookingService } from '../../core/services/booking.service';
import { NotificationService } from '../../core/services/notification.service';
import { ConfirmDialogComponent } from '../rooms/confirm-dialog.component';

@Component({
  selector: 'app-admin-bookings',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatTooltipModule
  ],
  template: `
    <div class="page-container">
      <!-- Page Header -->
      <div class="page-header">
        <h1 class="page-title">Manage Bookings</h1>
        <p class="page-subtitle">Review and approve pending room reservations</p>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="loading-container">
        <mat-spinner diameter="40"></mat-spinner>
      </div>

      <!-- Empty State -->
      <div *ngIf="!loading && pendingBookings.length === 0" class="empty-state">
        <mat-icon class="empty-state-icon">check_circle</mat-icon>
        <h3 class="empty-state-title">No pending bookings</h3>
        <p class="empty-state-description">All booking requests have been processed.</p>
      </div>

      <!-- Mobile View: Card List -->
      <div *ngIf="!loading && pendingBookings.length > 0 && isMobile" class="bookings-cards">
        <mat-card *ngFor="let booking of pendingBookings" class="booking-card">
          <mat-card-header>
            <mat-card-title>{{ booking.room.name }}</mat-card-title>
            <mat-card-subtitle>
              <mat-icon class="location-icon">location_on</mat-icon>
              {{ booking.room.location }}
            </mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="booking-info">
              <!-- Requester Info -->
              <div class="requester-info">
                <mat-icon>person</mat-icon>
                <div class="requester-details">
                  <span class="requester-name">{{ booking.user.firstname }} {{ booking.user.lastname }}</span>
                  <span class="requester-email">{{ booking.user.email }}</span>
                </div>
              </div>
              <!-- Booking Time -->
              <div class="booking-time">
                <mat-icon>schedule</mat-icon>
                <div class="time-details">
                  <span class="date">{{ formatDate(booking.startTime) }}</span>
                  <span class="time">{{ formatTime(booking.startTime) }} - {{ formatTime(booking.endTime) }}</span>
                </div>
              </div>
              <!-- Room Capacity -->
              <div class="room-capacity">
                <mat-icon>people</mat-icon>
                <span>Capacity: {{ booking.room.capacity }}</span>
              </div>
            </div>
          </mat-card-content>
          <mat-card-actions align="end">
            <button 
              mat-button 
              color="warn" 
              (click)="confirmReject(booking)"
              [disabled]="processingBookingId === booking.id">
              <mat-spinner *ngIf="processingBookingId === booking.id" diameter="18" class="button-spinner"></mat-spinner>
              <mat-icon *ngIf="processingBookingId !== booking.id">close</mat-icon>
              Reject
            </button>
            <button 
              mat-raised-button 
              color="primary" 
              (click)="confirmApprove(booking)"
              [disabled]="processingBookingId === booking.id">
              <mat-spinner *ngIf="processingBookingId === booking.id" diameter="18" class="button-spinner"></mat-spinner>
              <mat-icon *ngIf="processingBookingId !== booking.id">check</mat-icon>
              Approve
            </button>
          </mat-card-actions>
        </mat-card>
      </div>

      <!-- Desktop View: Table -->
      <div *ngIf="!loading && pendingBookings.length > 0 && !isMobile" class="table-container">
        <table mat-table [dataSource]="pendingBookings" class="bookings-table">
          <!-- Requester Column -->
          <ng-container matColumnDef="requester">
            <th mat-header-cell *matHeaderCellDef>Requester</th>
            <td mat-cell *matCellDef="let booking">
              <div class="requester-cell">
                <span class="requester-name">{{ booking.user.firstname }} {{ booking.user.lastname }}</span>
                <span class="requester-email">{{ booking.user.email }}</span>
              </div>
            </td>
          </ng-container>

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

          <!-- Actions Column -->
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Actions</th>
            <td mat-cell *matCellDef="let booking">
              <div class="action-buttons">
                <button 
                  mat-icon-button 
                  color="warn" 
                  (click)="confirmReject(booking)"
                  [disabled]="processingBookingId === booking.id"
                  matTooltip="Reject Booking">
                  <mat-spinner *ngIf="processingBookingId === booking.id" diameter="20"></mat-spinner>
                  <mat-icon *ngIf="processingBookingId !== booking.id">close</mat-icon>
                </button>
                <button 
                  mat-icon-button 
                  color="primary" 
                  (click)="confirmApprove(booking)"
                  [disabled]="processingBookingId === booking.id"
                  matTooltip="Approve Booking">
                  <mat-spinner *ngIf="processingBookingId === booking.id" diameter="20"></mat-spinner>
                  <mat-icon *ngIf="processingBookingId !== booking.id">check</mat-icon>
                </button>
              </div>
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
      border-left: 4px solid var(--status-pending);
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

    .requester-info {
      display: flex;
      align-items: flex-start;
      gap: 0.5rem;
      color: var(--sesame-text-light);
    }

    .requester-info mat-icon {
      font-size: 1.25rem;
      width: 1.25rem;
      height: 1.25rem;
      color: var(--sesame-primary);
      margin-top: 0.125rem;
    }

    .requester-details {
      display: flex;
      flex-direction: column;
    }

    .requester-name {
      font-weight: 500;
      color: var(--sesame-text);
    }

    .requester-email {
      font-size: 0.875rem;
      color: var(--sesame-text-light);
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

    .room-capacity {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: var(--sesame-text-light);
      font-size: 0.875rem;
    }

    .room-capacity mat-icon {
      font-size: 1.25rem;
      width: 1.25rem;
      height: 1.25rem;
      color: var(--sesame-text-muted);
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

    .requester-cell {
      display: flex;
      flex-direction: column;
    }

    .requester-cell .requester-name {
      font-weight: 500;
      color: var(--sesame-text);
    }

    .requester-cell .requester-email {
      font-size: 0.75rem;
      color: var(--sesame-text-light);
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

    .action-buttons {
      display: flex;
      gap: 0.25rem;
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
      color: var(--status-approved);
      opacity: 0.7;
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
export class AdminBookingsComponent implements OnInit {
  pendingBookings: Booking[] = [];
  displayedColumns: string[] = ['requester', 'room', 'date', 'time', 'actions'];
  loading = true;
  isMobile = false;
  processingBookingId: number | null = null;

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
    this.loadPendingBookings();
  }

  loadPendingBookings() {
    this.loading = true;
    this.bookingService.getAllBookings().subscribe({
      next: (data) => {
        // Filter to show only pending bookings
        this.pendingBookings = data.filter(booking => booking.status === 'PENDING');
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

  confirmApprove(booking: Booking) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Approve Booking',
        message: `Are you sure you want to approve the booking for "${booking.room.name}" requested by ${booking.user.firstname} ${booking.user.lastname}?`,
        confirmText: 'Approve',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.approveBooking(booking);
      }
    });
  }

  confirmReject(booking: Booking) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Reject Booking',
        message: `Are you sure you want to reject the booking for "${booking.room.name}" requested by ${booking.user.firstname} ${booking.user.lastname}?`,
        confirmText: 'Reject',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.rejectBooking(booking);
      }
    });
  }

  private approveBooking(booking: Booking) {
    this.processingBookingId = booking.id;
    this.bookingService.approveBooking(booking.id).subscribe({
      next: () => {
        this.processingBookingId = null;
        this.notificationService.success('Booking approved successfully');
        this.loadPendingBookings();
      },
      error: (err) => {
        this.processingBookingId = null;
        console.error(err);
        this.notificationService.error('Failed to approve booking');
      }
    });
  }

  private rejectBooking(booking: Booking) {
    this.processingBookingId = booking.id;
    this.bookingService.rejectBooking(booking.id).subscribe({
      next: () => {
        this.processingBookingId = null;
        this.notificationService.success('Booking rejected successfully');
        this.loadPendingBookings();
      },
      error: (err) => {
        this.processingBookingId = null;
        console.error(err);
        this.notificationService.error('Failed to reject booking');
      }
    });
  }
}
