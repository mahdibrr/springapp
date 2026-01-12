import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Room } from '../../core/models/room.model';
import { RoomService } from '../../core/services/room.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-room-edit',
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
    <div class="page-container">
      <!-- Loading State -->
      <div *ngIf="loading" class="loading-container">
        <mat-spinner diameter="40"></mat-spinner>
      </div>

      <!-- Form -->
      <div *ngIf="!loading" class="form-wrapper">
        <mat-card class="room-form-card">
          <mat-card-header>
            <mat-card-title>
              <div class="card-title-content">
                <mat-icon>{{ isEditMode ? 'edit' : 'add' }}</mat-icon>
                {{ isEditMode ? 'Edit Room' : 'Add New Room' }}
              </div>
            </mat-card-title>
            <mat-card-subtitle>
              {{ isEditMode ? 'Update room details' : 'Create a new room for reservations' }}
            </mat-card-subtitle>
          </mat-card-header>

          <mat-card-content>
            <form [formGroup]="roomForm" (ngSubmit)="onSubmit()" class="room-form">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Room Name</mat-label>
                <input matInput formControlName="name" placeholder="e.g., Conference Room A">
                <mat-icon matPrefix>meeting_room</mat-icon>
                <mat-error *ngIf="roomForm.get('name')?.hasError('required')">
                  Room name is required
                </mat-error>
              </mat-form-field>

              <div class="form-row">
                <mat-form-field appearance="outline" class="half-width">
                  <mat-label>Capacity</mat-label>
                  <input matInput type="number" formControlName="capacity" placeholder="e.g., 10">
                  <mat-icon matPrefix>people</mat-icon>
                  <mat-error *ngIf="roomForm.get('capacity')?.hasError('required')">
                    Capacity is required
                  </mat-error>
                  <mat-error *ngIf="roomForm.get('capacity')?.hasError('min')">
                    Capacity must be at least 1
                  </mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline" class="half-width">
                  <mat-label>Location</mat-label>
                  <input matInput formControlName="location" placeholder="e.g., Building A, Floor 2">
                  <mat-icon matPrefix>location_on</mat-icon>
                  <mat-error *ngIf="roomForm.get('location')?.hasError('required')">
                    Location is required
                  </mat-error>
                </mat-form-field>
              </div>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Equipment</mat-label>
                <input matInput formControlName="equipments" placeholder="e.g., Projector, Whiteboard, Video Conference">
                <mat-icon matPrefix>devices</mat-icon>
                <mat-hint>Separate multiple items with commas</mat-hint>
              </mat-form-field>

              <div class="form-actions">
                <a mat-button routerLink="/rooms" class="cancel-btn">
                  <mat-icon>arrow_back</mat-icon>
                  Cancel
                </a>
                <button 
                  mat-raised-button 
                  color="primary" 
                  type="submit" 
                  [disabled]="roomForm.invalid || submitting"
                  class="submit-btn"
                >
                  <mat-spinner *ngIf="submitting" diameter="20"></mat-spinner>
                  <mat-icon *ngIf="!submitting">{{ isEditMode ? 'save' : 'add' }}</mat-icon>
                  {{ submitting ? 'Saving...' : (isEditMode ? 'Save Changes' : 'Create Room') }}
                </button>
              </div>
            </form>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .page-container {
      padding: 1.5rem;
      max-width: 800px;
      margin: 0 auto;
    }

    .loading-container {
      display: flex;
      justify-content: center;
      padding: 3rem;
    }

    .form-wrapper {
      display: flex;
      justify-content: center;
    }

    .room-form-card {
      width: 100%;
      max-width: 600px;
      background-color: var(--sesame-surface);
      border-radius: var(--radius-lg);
    }

    .card-title-content {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: var(--sesame-primary);
    }

    .card-title-content mat-icon {
      font-size: 1.5rem;
      width: 1.5rem;
      height: 1.5rem;
    }

    mat-card-header {
      margin-bottom: 1rem;
    }

    mat-card-title {
      font-size: 1.25rem;
      font-weight: 600;
    }

    mat-card-subtitle {
      color: var(--sesame-text-light);
    }

    .room-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      padding-top: 1rem;
    }

    .full-width {
      width: 100%;
    }

    .form-row {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .half-width {
      flex: 1;
      min-width: 200px;
    }

    mat-form-field mat-icon[matPrefix] {
      color: var(--sesame-text-muted);
      margin-right: 0.5rem;
    }

    .form-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid #e5e7eb;
    }

    .cancel-btn {
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }

    .submit-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .submit-btn mat-spinner {
      margin-right: 0.25rem;
    }

    @media (max-width: 480px) {
      .form-row {
        flex-direction: column;
      }

      .half-width {
        width: 100%;
      }

      .form-actions {
        flex-direction: column-reverse;
        gap: 1rem;
      }

      .form-actions button,
      .form-actions a {
        width: 100%;
      }
    }
  `]
})
export class RoomEditComponent implements OnInit {
  roomForm: FormGroup;
  isEditMode = false;
  roomId: number | null = null;
  loading = false;
  submitting = false;

  constructor(
    private fb: FormBuilder,
    private roomService: RoomService,
    private notificationService: NotificationService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.roomForm = this.fb.group({
      name: ['', Validators.required],
      capacity: [10, [Validators.required, Validators.min(1)]],
      location: ['', Validators.required],
      equipments: ['']
    });
  }

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.roomId = parseInt(idParam, 10);
      this.isEditMode = true;
      this.loadRoom();
    }
  }

  private loadRoom() {
    if (!this.roomId) return;

    this.loading = true;
    this.roomService.getRoomById(this.roomId).subscribe({
      next: (room) => {
        this.roomForm.patchValue({
          name: room.name,
          capacity: room.capacity,
          location: room.location,
          equipments: room.equipments || ''
        });
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.notificationService.error('Failed to load room details');
        this.loading = false;
        this.router.navigate(['/rooms']);
      }
    });
  }

  onSubmit() {
    if (this.roomForm.invalid || this.submitting) return;

    this.submitting = true;
    const roomData: Room = {
      id: this.roomId || 0,
      ...this.roomForm.value
    };

    const operation = this.isEditMode
      ? this.roomService.updateRoom(this.roomId!, roomData)
      : this.roomService.createRoom(roomData);

    operation.subscribe({
      next: () => {
        const message = this.isEditMode
          ? `Room "${roomData.name}" updated successfully`
          : `Room "${roomData.name}" created successfully`;
        this.notificationService.success(message);
        this.router.navigate(['/rooms']);
      },
      error: (err) => {
        console.error(err);
        const message = this.isEditMode
          ? 'Failed to update room'
          : 'Failed to create room';
        this.notificationService.error(message);
        this.submitting = false;
      }
    });
  }
}
