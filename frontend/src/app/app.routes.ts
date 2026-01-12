import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { RoomListComponent } from './pages/rooms/room-list.component';
import { RoomAddComponent } from './pages/rooms/room-add.component';
import { RoomEditComponent } from './pages/rooms/room-edit.component';
import { BookingComponent } from './pages/bookings/booking.component';
import { MyBookingsComponent } from './pages/my-bookings/my-bookings.component';
import { AdminBookingsComponent } from './pages/admin-bookings/admin-bookings.component';
import { LayoutComponent } from './layout/layout.component';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
    // Public routes (no layout)
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    
    // Protected routes (wrapped with LayoutComponent)
    {
        path: '',
        component: LayoutComponent,
        canActivate: [authGuard],
        children: [
            { path: 'dashboard', component: DashboardComponent },
            { path: 'rooms', component: RoomListComponent },
            { path: 'rooms/add', component: RoomAddComponent },
            { path: 'rooms/:id/edit', component: RoomEditComponent },
            { path: 'rooms/:id/book', component: BookingComponent },
            { path: 'my-bookings', component: MyBookingsComponent },
            
            // Admin-only routes
            { 
                path: 'admin/bookings', 
                component: AdminBookingsComponent, 
                canActivate: [adminGuard] 
            },
            
            // Default redirect
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
        ]
    },
    
    // Fallback redirect
    { path: '**', redirectTo: 'dashboard' }
];
