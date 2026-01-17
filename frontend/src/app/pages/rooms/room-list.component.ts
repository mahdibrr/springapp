import { Component, OnInit, HostListener, ChangeDetectorRef } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Room } from '../../core/models/room.model';
import { RoomService } from '../../core/services/room.service';
import { UserService } from '../../core/services/user.service';
import { NotificationService } from '../../core/services/notification.service';
import { ConfirmDialogComponent } from './confirm-dialog.component';

@Component({
  selector: 'app-room-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    RouterLink
  ],
  template: `
    <div class="page-container">
      <!-- Page Header -->
      <div class="page-header flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 class="page-title">Rooms</h1>
          <p class="page-subtitle">Browse and manage available rooms</p>
        </div>
        <a *ngIf="isAdmin" mat-raised-button color="primary" routerLink="/rooms/add" class="add-room-btn">
          <mat-icon>add</mat-icon>
          Add Room
        </a>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="loading-container">
        <mat-spinner diameter="40"></mat-spinner>
      </div>

      <!-- Empty State -->
      <div *ngIf="!loading && rooms.length === 0" class="empty-state">
        <mat-icon class="empty-state-icon">meeting_room</mat-icon>
        <h3 class="empty-state-title">No rooms available</h3>
        <p class="empty-state-description">There are no rooms in the system yet.</p>
      </div>

      <!-- Mobile View: Card Grid -->
      <div *ngIf="!loading && rooms.length > 0 && isMobile" class="room-cards-grid">
        <mat-card *ngFor="let room of rooms" class="room-card">
          <mat-card-header>
            <mat-card-title>{{ room.name }}</mat-card-title>
            <mat-card-subtitle>
              <mat-icon class="location-icon">location_on</mat-icon>
              {{ room.location }}
            </mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="room-info">
              <div class="capacity-info">
                <mat-icon>people</mat-icon>
                <span>{{ room.capacity }} people</span>
              </div>
              <div class="equipment-chips" *ngIf="room.equipments">
                <span class="equipment-chip" *ngFor="let equipment of getEquipmentList(room.equipments)">
                  {{ equipment }}
                </span>
              </div>
            </div>
          </mat-card-content>
          <mat-card-actions align="end">
            <a mat-button color="primary" [routerLink]="['/rooms', room.id, 'book']">
              <mat-icon>event</mat-icon>
              Book
            </a>
            <a *ngIf="isAdmin" mat-button color="accent" [routerLink]="['/rooms', room.id, 'edit']">
              <mat-icon>edit</mat-icon>
              Edit
            </a>
            <button *ngIf="isAdmin" mat-button color="warn" (click)="confirmDelete(room)" [disabled]="deletingRoomId === room.id">
              <mat-spinner *ngIf="deletingRoomId === room.id" diameter="18" class="button-spinner"></mat-spinner>
              <mat-icon *ngIf="deletingRoomId !== room.id">delete</mat-icon>
              {{ deletingRoomId === room.id ? 'Deleting...' : 'Delete' }}
            </button>
          </mat-card-actions>
        </mat-card>
      </div>

      <!-- Desktop View: Table -->
      <div *ngIf="!loading && rooms.length > 0 && !isMobile" class="table-container">
        <table mat-table [dataSource]="rooms" class="rooms-table">
          <!-- Name Column -->
          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef>Name</th>
            <td mat-cell *matCellDef="let room">
              <span class="room-name">{{ room.name }}</span>
            </td>
          </ng-container>

          <!-- Capacity Column -->
          <ng-container matColumnDef="capacity">
            <th mat-header-cell *matHeaderCellDef>Capacity</th>
            <td mat-cell *matCellDef="let room">
              <div class="capacity-cell">
                <mat-icon>people</mat-icon>
                {{ room.capacity }}
              </div>
            </td>
          </ng-container>

          <!-- Location Column -->
          <ng-container matColumnDef="location">
            <th mat-header-cell *matHeaderCellDef>Location</th>
            <td mat-cell *matCellDef="let room">{{ room.location }}</td>
          </ng-container>

          <!-- Equipment Column -->
          <ng-container matColumnDef="equipments">
            <th mat-header-cell *matHeaderCellDef>Equipment</th>
            <td mat-cell *matCellDef="let room">
              <div class="equipment-chips">
                <span class="equipment-chip" *ngFor="let equipment of getEquipmentList(room.equipments)">
                  {{ equipment }}
                </span>
              </div>
            </td>
          </ng-container>

          <!-- Actions Column -->
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Actions</th>
            <td mat-cell *matCellDef="let room">
              <div class="action-buttons">
                <a mat-icon-button color="primary" [routerLink]="['/rooms', room.id, 'book']" matTooltip="Book Room">
                  <mat-icon>event</mat-icon>
                </a>
                <a *ngIf="isAdmin" mat-icon-button color="accent" [routerLink]="['/rooms', room.id, 'edit']" matTooltip="Edit Room">
                  <mat-icon>edit</mat-icon>
                </a>
                <button *ngIf="isAdmin" mat-icon-button color="warn" (click)="confirmDelete(room)" [disabled]="deletingRoomId === room.id" matTooltip="Delete Room">
                  <mat-spinner *ngIf="deletingRoomId === room.id" diameter="20"></mat-spinner>
                  <mat-icon *ngIf="deletingRoomId !== room.id">delete</mat-icon>
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

    .add-room-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    /* Card Grid Styles */
    .room-cards-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1rem;
    }

    @media (min-width: 480px) {
      .room-cards-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    .room-card {
      background-color: var(--sesame-surface);
      border-radius: var(--radius-lg);
    }

    .room-card mat-card-header {
      padding-bottom: 0.5rem;
    }

    .room-card mat-card-title {
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--sesame-primary);
    }

    .room-card mat-card-subtitle {
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

    .room-info {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .capacity-info {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: var(--sesame-text-light);
    }

    .capacity-info mat-icon {
      font-size: 1.25rem;
      width: 1.25rem;
      height: 1.25rem;
      color: var(--sesame-secondary);
    }

    /* Equipment Chips */
    .equipment-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 0.25rem;
    }

    .equipment-chip {
      display: inline-flex;
      align-items: center;
      padding: 0.125rem 0.5rem;
      background-color: var(--sesame-background);
      border-radius: var(--radius-full);
      font-size: 0.75rem;
      color: var(--sesame-text-light);
      border: 1px solid #e5e7eb;
    }

    /* Table Styles */
    .table-container {
      background-color: var(--sesame-surface);
      border-radius: var(--radius-lg);
      overflow: hidden;
      box-shadow: var(--shadow-sm);
    }

    .rooms-table {
      width: 100%;
    }

    .rooms-table th {
      background-color: var(--sesame-background);
      font-weight: 600;
      color: var(--sesame-text);
    }

    .rooms-table td {
      padding: 1rem;
    }

    .room-name {
      font-weight: 500;
      color: var(--sesame-primary);
    }

    .capacity-cell {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .capacity-cell mat-icon {
      font-size: 1.125rem;
      width: 1.125rem;
      height: 1.125rem;
      color: var(--sesame-secondary);
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
export class RoomListComponent implements OnInit {
  rooms: Room[] = [];
  displayedColumns: string[] = ['name', 'capacity', 'location', 'equipments', 'actions'];
  loading = true;
  isAdmin = false;
  isMobile = false;
  deletingRoomId: number | null = null;

  constructor(
    private roomService: RoomService,
    private userService: UserService,
    private notificationService: NotificationService,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef
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
    this.isAdmin = this.userService.isAdmin();
    this.loadRooms();
  }

  loadRooms() {
    this.loading = true;
    this.roomService.getAllRooms().subscribe({
      next: (data) => {
        this.rooms = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.notificationService.error('Failed to load rooms');
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  getEquipmentList(equipments: string): string[] {
    if (!equipments || equipments.trim() === '') {
      return [];
    }
    return equipments.split(',').map(e => e.trim()).filter(e => e.length > 0);
  }

  confirmDelete(room: Room) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Room',
        message: `Are you sure you want to delete "${room.name}"? This action cannot be undone.`,
        confirmText: 'Delete',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deleteRoom(room);
      }
    });
  }

  private deleteRoom(room: Room) {
    this.deletingRoomId = room.id;
    this.roomService.deleteRoom(room.id).subscribe({
      next: () => {
        this.deletingRoomId = null;
        this.notificationService.success(`Room "${room.name}" deleted successfully`);
        this.loadRooms();
      },
      error: (err) => {
        this.deletingRoomId = null;
        console.error(err);
        this.notificationService.error('Failed to delete room');
      }
    });
  }
}
