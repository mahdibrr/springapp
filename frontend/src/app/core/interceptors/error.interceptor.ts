import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const notificationService = inject(NotificationService);

  // Skip error handling for auth endpoints - they handle their own errors
  const isAuthEndpoint = req.url.includes('/auth/');

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'An unexpected error occurred';

      switch (error.status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          // Don't show notification for auth endpoints
          if (!isAuthEndpoint) {
            errorMessage = 'Your session has expired. Please log in again.';
            authService.logout();
          }
          break;

        case 403:
          // Forbidden - user doesn't have permission
          if (!isAuthEndpoint) {
            errorMessage = 'Access denied. You do not have permission to perform this action.';
            notificationService.error(errorMessage);
          }
          break;

        case 400:
          // Bad Request - validation error
          // Skip notification for auth endpoints - they handle their own errors
          if (!isAuthEndpoint) {
            errorMessage = error.error?.error || error.error?.message || 'Invalid request. Please check your input.';
            notificationService.error(errorMessage);
          }
          break;

        case 404:
          // Not Found
          if (!isAuthEndpoint) {
            errorMessage = error.error?.error || 'The requested resource was not found.';
            notificationService.error(errorMessage);
          }
          break;

        case 500:
          // Server Error
          if (!isAuthEndpoint) {
            errorMessage = 'A server error occurred. Please try again later.';
            notificationService.error(errorMessage);
          }
          break;

        default:
          // Other errors (including connection errors)
          // Skip notification for auth endpoints - they handle their own errors
          if (!isAuthEndpoint) {
            if (error.status === 0) {
              errorMessage = 'Unable to connect to the server. Please check your internet connection.';
            } else {
              errorMessage = error.error?.error || error.error?.message || `Error: ${error.statusText}`;
            }
            notificationService.error(errorMessage);
          }
          break;
      }

      return throwError(() => error);
    })
  );
};
