import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { CommonModule } from '@angular/common';
import { RoomService } from '../../core/services/room.service';
import { BookingService } from '../../core/services/booking.service';
import { NotificationService } from '../../core/services/notification.service';
import { Room } from '../../core/models/room.model';

@Component({
    selector: 'app-booking',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatCardModule,
        MatInputModule,
        MatButtonModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatIconModule,
        MatChipsModule,
        MatProgressSpinnerModule,
        MatDividerModule
    ],
    template: `
    <div class="booking-container">
      <!-- Loading State -->
      <div *ngIf="isLoadingRoom" class="loading-container">
        <mat-spinner diameter="40"></mat-spinner>
      </div>

      <!-- Room Not Found -->
      <div *ngIf="!isLoadingRoom && !room && roomId" class="empty-state">
        <mat-icon class="empty-state-icon">meeting_room</mat-icon>
        <div class="empty-state-title">Room Not Found</div>
        <div class="empty-state-description">The room you're trying to book doesn't exist.</div>
        <button mat-raised-button color="primary" class="mt-4" (click)="goBack()">
          <mat-icon>arrow_back</mat-icon>
          Back to Rooms
        </button>
      </div>

      <!-- Booking Form -->
      <div *ngIf="!isLoadingRoom && room" class="booking-content">
        <!-- Room Details Card -->
        <mat-card class="room-details-card">
          <mat-card-header>
            <mat-icon mat-card-avatar class="room-icon">meeting_room</mat-icon>
            <mat-card-title>{{ room.name }}</mat-card-title>
            <mat-card-subtitle>
              <mat-icon class="inline-icon">location_on</mat-icon>
              {{ room.location }}
            </mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="room-info">
              <div class="info-item">
                <mat-icon>people</mat-icon>
                <span>Capacity: {{ room.capacity }} people</span>
              </div>
              <div class="equipment-section" *ngIf="room.equipments">
                <div class="equipment-label">
                  <mat-icon>devices</mat-icon>
                  <span>Equipment:</span>
                </div>
                <mat-chip-set class="equipment-chips">
                  <mat-chip *ngFor="let equipment of getEquipmentList()" class="equipment-chip">
                    {{ equipment }}
                  </mat-chip>
                </mat-chip-set>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Booking Form Card -->
        <mat-card class="booking-form-card">
          <mat-card-header>
            <mat-card-title>
              <mat-icon class="title-icon">event</mat-icon>
              Schedule Your Booking
            </mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <form [formGroup]="bookingForm" (ngSubmit)="onSubmit()" class="booking-form">
              <div class="datetime-section">
                <div class="datetime-field">
                  <label class="field-label">
                    <mat-icon>schedule</mat-icon>
                    Start Date & Time
                  </label>
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Select start time</mat-label>
                    <input matInput type="datetime-local" formControlName="startTime" [min]="minDateTime">
                    <mat-error *ngIf="bookingForm.get('startTime')?.hasError('required')">
                      Start time is required
                    </mat-error>
                  </mat-form-field>
                </div>

                <div class="datetime-field">
                  <label class="field-label">
                    <mat-icon>schedule</mat-icon>
                    End Date & Time
                  </label>
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Select end time</mat-label>
                    <input matInput type="datetime-local" formControlName="endTime" [min]="bookingForm.get('startTime')?.value || minDateTime">
                    <mat-error *ngIf="bookingForm.get('endTime')?.hasError('required')">
                      End time is required
                    </mat-error>
                  </mat-form-field>
                </div>
              </div>

              <mat-divider class="form-divider"></mat-divider>

              <div class="form-actions">
                <button mat-stroked-button type="button" (click)="goBack()" [disabled]="isSubmitting">
                  <mat-icon>arrow_back</mat-icon>
                  Cancel
                </button>
                <button mat-raised-button color="primary" type="submit" 
                        [disabled]="bookingForm.invalid || isSubmitting || !isValidTimeRange()">
                  <mat-spinner *ngIf="isSubmitting" diameter="20" class="button-spinner"></mat-spinner>
                  <mat-icon *ngIf="!isSubmitting">check_circle</mat-icon>
                  {{ isSubmitting ? 'Booking...' : 'Confirm Booking' }}
                </button>
              </div>

              <div *ngIf="!isValidTimeRange() && bookingForm.get('startTime')?.value && bookingForm.get('endTime')?.value" 
                   class="validation-error">
                <mat-icon>error</mat-icon>
                End time must be after start time
              </div>
            </form>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
    styles: [`
    .booking-container {
      padding: 1.5rem;
      max-width: 800px;
      margin: 0 auto;
    }

    .booking-content {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .room-details-card {
      background: linear-gradient(135deg, var(--sesame-primary) 0%, var(--sesame-primary-dark) 100%);
      color: white;
    }

    .room-details-card mat-card-header {
      padding-bottom: 1rem;
    }

    .room-details-card mat-card-title {
      color: white !important;
      font-size: 1.5rem;
      font-weight: 600;
    }

    .room-details-card mat-card-subtitle {
      color: rgba(255, 255, 255, 0.9) !important;
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }

    .room-icon {
      background-color: rgba(255, 255, 255, 0.2);
      border-radius: 50%;
      padding: 0.5rem;
      width: 48px !important;
      height: 48px !important;
      font-size: 24px !important;
      display: flex !important;
      align-items: center;
      justify-content: center;
    }

    .inline-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    .room-info {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      padding-top: 0.5rem;
    }

    .info-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: rgba(255, 255, 255, 0.95);
    }

    .info-item mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .equipment-section {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .equipment-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: rgba(255, 255, 255, 0.95);
    }

    .equipment-label mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .equipment-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .equipment-chip {
      background-color: rgba(255, 255, 255, 0.2) !important;
      color: white !important;
      font-size: 0.75rem;
    }

    .booking-form-card {
      background-color: var(--sesame-surface);
    }

    .booking-form-card mat-card-title {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: var(--sesame-primary);
      font-size: 1.25rem;
    }

    .title-icon {
      color: var(--sesame-primary);
    }

    .booking-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      padding-top: 1rem;
    }

    .datetime-section {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1rem;
    }

    @media (min-width: 600px) {
      .datetime-section {
        grid-template-columns: 1fr 1fr;
      }
    }

    .datetime-field {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .field-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-weight: 500;
      color: var(--sesame-text);
      font-size: 0.875rem;
    }

    .field-label mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: var(--sesame-primary);
    }

    .full-width {
      width: 100%;
    }

    .form-divider {
      margin: 1rem 0;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      padding-top: 0.5rem;
    }

    .form-actions button {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .button-spinner {
      margin-right: 0.5rem;
    }

    .validation-error {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: var(--status-rejected);
      font-size: 0.875rem;
      padding: 0.75rem;
      background-color: var(--status-rejected-bg);
      border-radius: var(--radius-md);
      margin-top: 0.5rem;
    }

    .validation-error mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .loading-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 300px;
    }

    .empty-state {
      text-align: center;
      padding: 3rem;
      background-color: var(--sesame-surface);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-md);
    }

    .empty-state-icon {
      font-size: 64px !important;
      width: 64px !important;
      height: 64px !important;
      color: var(--sesame-text-muted);
      margin-bottom: 1rem;
    }

    .empty-state-title {
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--sesame-text);
      margin-bottom: 0.5rem;
    }

    .empty-state-description {
      color: var(--sesame-text-light);
    }
  `]
})
export class BookingComponent implements OnInit {
    bookingForm: FormGroup;
    roomId: number | null = null;
    room: Room | null = null;
    isLoadingRoom = false;
    isSubmitting = false;
    minDateTime: string;

    constructor(
        private fb: FormBuilder,
        private router: Router,
        private route: ActivatedRoute,
        private roomService: RoomService,
        private bookingService: BookingService,
        private notificationService: NotificationService
    ) {
        this.bookingForm = this.fb.group({
            startTime: ['', Validators.required],
            endTime: ['', Validators.required]
        });

        // Set minimum datetime to now
        const now = new Date();
        this.minDateTime = this.formatDateTimeLocal(now);
    }

    ngOnInit() {
        this.route.paramMap.subscribe(params => {
            const id = params.get('id');
            if (id) {
                this.roomId = +id;
                this.loadRoom();
            }
        });
    }

    loadRoom() {
        if (!this.roomId) return;

        this.isLoadingRoom = true;
        this.roomService.getRoomById(this.roomId).subscribe({
            next: (room) => {
                this.room = room;
                this.isLoadingRoom = false;
            },
            error: (err) => {
                this.isLoadingRoom = false;
                this.notificationService.error('Failed to load room details');
                console.error('Error loading room:', err);
            }
        });
    }

    getEquipmentList(): string[] {
        if (!this.room?.equipments) return [];
        return this.room.equipments.split(',').map(e => e.trim()).filter(e => e.length > 0);
    }

    isValidTimeRange(): boolean {
        const startTime = this.bookingForm.get('startTime')?.value;
        const endTime = this.bookingForm.get('endTime')?.value;

        if (!startTime || !endTime) return true;

        return new Date(endTime) > new Date(startTime);
    }

    formatDateTimeLocal(date: Date): string {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    }

    goBack() {
        this.router.navigate(['/rooms']);
    }

    onSubmit() {
        if (this.bookingForm.valid && this.roomId && this.isValidTimeRange()) {
            this.isSubmitting = true;

            const payload = {
                roomId: this.roomId,
                startTime: this.bookingForm.value.startTime,
                endTime: this.bookingForm.value.endTime
            };

            this.bookingService.createBooking(payload).subscribe({
                next: () => {
                    this.isSubmitting = false;
                    this.notificationService.success('Booking created successfully! Waiting for approval.');
                    this.router.navigate(['/my-bookings']);
                },
                error: (err) => {
                    this.isSubmitting = false;
                    const errorMessage = err.error?.error || err.error?.message || 'Failed to create booking';
                    this.notificationService.error(errorMessage);
                }
            });
        }
    }
}
