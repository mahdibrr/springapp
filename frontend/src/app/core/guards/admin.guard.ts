import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { UserService } from '../services/user.service';
import { map, take, switchMap, of } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = (route, state) => {
    const userService = inject(UserService);
    const authService = inject(AuthService);
    const router = inject(Router);

    return authService.isAuthenticated$.pipe(
        take(1),
        switchMap(isAuthenticated => {
            if (!isAuthenticated) {
                router.navigate(['/login']);
                return of(false);
            }

            // Check if user is already cached
            const cachedUser = userService.getCachedUser();
            if (cachedUser) {
                if (cachedUser.role === 'ADMIN') {
                    return of(true);
                } else {
                    router.navigate(['/dashboard']);
                    return of(false);
                }
            }

            // Fetch user if not cached
            return userService.getCurrentUser().pipe(
                map(user => {
                    if (user.role === 'ADMIN') {
                        return true;
                    } else {
                        router.navigate(['/dashboard']);
                        return false;
                    }
                })
            );
        })
    );
};
