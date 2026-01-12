import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  constructor(private snackBar: MatSnackBar) {}

  success(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['notification-success']
    });
  }

  error(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 0, // Requires manual dismiss
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['notification-error']
    });
  }

  info(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['notification-info']
    });
  }
}
