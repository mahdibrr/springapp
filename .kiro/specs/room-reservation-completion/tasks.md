# Implementation Plan: Room Reservation System Completion

## Overview

This implementation plan covers completing the Room Reservation System with responsive SESAME-branded frontend, missing backend functionality, and proper frontend-backend integration. Tasks are organized to build incrementally, with each task building on previous work.

## Tasks

- [x] 1. Backend: Add User Profile Endpoint and Booking Cancellation
  - [x] 1.1 Create UserController with GET /api/v1/users/me endpoint
    - Create UserController.java in controller package
    - Create UserDTO.java to exclude password from response
    - Return current authenticated user's profile
    - _Requirements: 7.1, 7.2_
  - [x] 1.2 Add booking cancellation endpoint to BookingController
    - Add DELETE /api/v1/bookings/{id} endpoint
    - Validate booking belongs to current user
    - Validate booking status is PENDING
    - Return 403 for other user's bookings, 400 for non-pending
    - _Requirements: 8.1, 8.2, 8.3_
  - [x] 1.3 Add CANCELLED status to BookingStatus enum
    - Update BookingStatus.java to include CANCELLED
    - _Requirements: 8.1_
  - [ ]* 1.4 Write property tests for booking cancellation
    - **Property 8: Own Pending Booking Cancellation**
    - **Property 9: Cross-User Booking Cancellation Prevention**
    - **Property 10: Non-Pending Booking Cancellation Prevention**
    - **Validates: Requirements 8.1, 8.2, 8.3**

- [x] 2. Frontend: Create Environment Configuration and Core Services
  - [x] 2.1 Create environment configuration files
    - Create src/environments/environment.ts with apiUrl
    - Create src/environments/environment.prod.ts
    - _Requirements: 9.4_
  - [x] 2.2 Create RoomService
    - Implement getAllRooms, getRoomById, createRoom, updateRoom, deleteRoom
    - Use environment apiUrl
    - _Requirements: 9.1_
  - [x] 2.3 Create BookingService
    - Implement createBooking, getMyBookings, cancelBooking
    - Implement admin methods: getAllBookings, approveBooking, rejectBooking
    - _Requirements: 9.2_
  - [x] 2.4 Create UserService
    - Implement getCurrentUser method
    - Cache user data in BehaviorSubject
    - _Requirements: 9.3_
  - [x] 2.5 Create NotificationService
    - Implement success, error, info methods
    - Use Angular Material Snackbar
    - _Requirements: 10.1, 10.2, 10.3_

- [x] 3. Frontend: Create SESAME Theme and Global Styles
  - [x] 3.1 Create custom Angular Material theme with SESAME colors
    - Update material-theme.scss with SESAME palette
    - Define primary (#00478F), accent (#22C0C2) palettes
    - _Requirements: 1.1_
  - [x] 3.2 Create global CSS variables and utility classes
    - Define CSS custom properties for colors
    - Create responsive utility classes
    - Define status color classes (pending, approved, rejected)
    - _Requirements: 1.1, 3.3_

- [x] 4. Frontend: Create Layout and Navigation Components
  - [x] 4.1 Create LayoutComponent with responsive shell
    - Create layout folder with layout.component.ts
    - Implement header with logo and user info
    - Implement responsive sidebar container
    - _Requirements: 1.4, 1.5, 2.5_
  - [x] 4.2 Create SidebarComponent with navigation menu
    - Create sidebar.component.ts with menu items
    - Implement role-based menu filtering
    - Implement active route highlighting
    - _Requirements: 2.1, 2.2, 2.4_
  - [x] 4.3 Implement mobile responsive behavior
    - Add hamburger menu toggle for mobile
    - Implement sidebar overlay on mobile
    - Hide sidebar by default on mobile
    - _Requirements: 1.2, 1.3, 2.3_
  - [ ]* 4.4 Write property test for role-based UI visibility
    - **Property 1: Role-Based UI Visibility**
    - **Validates: Requirements 2.2, 3.4**

- [ ] 5. Checkpoint - Verify layout and services
  - Ensure all services compile without errors
  - Ensure layout renders correctly
  - Ask the user if questions arise

- [x] 6. Frontend: Enhance Dashboard Component
  - [x] 6.1 Update DashboardComponent with new design
    - Use SESAME color scheme for cards
    - Display user's booking count and pending count
    - Add admin-only statistics section
    - _Requirements: 3.1, 3.4_
  - [x] 6.2 Add recent bookings list to dashboard
    - Display last 5 bookings with status badges
    - Use color-coded status indicators
    - _Requirements: 3.2, 3.3_
  - [x] 6.3 Update backend DashboardController for user-specific stats
    - Add endpoint for user-specific dashboard data
    - Include recent bookings in response
    - _Requirements: 3.1, 3.2_

- [x] 7. Frontend: Enhance Room List and Form Components
  - [x] 7.1 Update RoomListComponent with responsive design
    - Implement card grid for mobile, table for desktop
    - Add equipment chips display
    - Show edit/delete buttons for admin
    - _Requirements: 4.1, 4.5_
  - [x] 7.2 Create RoomEditComponent for editing rooms
    - Create room-edit.component.ts with form
    - Pre-fill form with existing room data
    - Handle create and update modes
    - _Requirements: 4.2, 4.3_
  - [x] 7.3 Add delete confirmation dialog
    - Use Angular Material Dialog for confirmation
    - Call deleteRoom on confirm
    - _Requirements: 4.4_

- [x] 8. Frontend: Create My Bookings Page
  - [x] 8.1 Create MyBookingsComponent
    - Create my-bookings.component.ts
    - Display all user's bookings in responsive list/table
    - Show room name, time, status with badges
    - _Requirements: 5.1, 5.3_
  - [x] 8.2 Implement booking cancellation
    - Add cancel button for pending bookings
    - Call cancelBooking service method
    - Show confirmation dialog before cancel
    - _Requirements: 5.2_
  - [ ]* 8.3 Write property test for pending booking cancellation availability
    - **Property 3: Pending Booking Cancellation Availability**
    - **Validates: Requirements 5.2**

- [x] 9. Frontend: Create Admin Bookings Page
  - [x] 9.1 Create AdminBookingsComponent
    - Create admin-bookings.component.ts
    - Display all pending bookings with requester info
    - Show room details and requested time
    - _Requirements: 6.1, 6.4_
  - [x] 9.2 Implement approve/reject actions
    - Add approve and reject buttons
    - Call approveBooking/rejectBooking service methods
    - Refresh list after action
    - _Requirements: 6.2, 6.3_
  - [ ]* 9.3 Write property tests for booking approval/rejection
    - **Property 5: Booking Approval Status Transition**
    - **Property 6: Booking Rejection Status Transition**
    - **Validates: Requirements 6.2, 6.3**

- [x] 10. Frontend: Update Routing and App Configuration
  - [x] 10.1 Update app.routes.ts with new routes
    - Add /my-bookings route
    - Add /admin/bookings route with admin guard
    - Wrap protected routes with LayoutComponent
    - _Requirements: 2.1_
  - [x] 10.2 Create AdminGuard for admin-only routes
    - Check user role before allowing access
    - Redirect non-admins to dashboard
    - _Requirements: 2.2_
  - [x] 10.3 Update app.config.ts with providers
    - Add NotificationService provider
    - Configure HTTP interceptors
    - _Requirements: 10.3_

- [x] 11. Frontend: Enhance Login and Register Pages
  - [x] 11.1 Update LoginComponent with SESAME styling
    - Apply SESAME color scheme
    - Add logo to login page
    - Improve responsive layout
    - _Requirements: 1.1_
  - [x] 11.2 Update RegisterComponent with SESAME styling
    - Apply SESAME color scheme
    - Match login page design
    - _Requirements: 1.1_

- [x] 12. Frontend: Update Booking Component
  - [x] 12.1 Enhance BookingComponent with better UX
    - Show room details on booking page
    - Improve date/time picker styling
    - Add success/error notifications
    - _Requirements: 10.1, 10.2_

- [x] 13. Checkpoint - Full integration test
  - Ensure all pages render correctly
  - Test booking flow end-to-end
  - Test admin approval flow
  - Ask the user if questions arise

- [x] 14. Final Polish and Error Handling
  - [x] 14.1 Add global error interceptor
    - Handle 401, 403, 400, 500 errors
    - Display appropriate notifications
    - _Requirements: 10.1_
  - [x] 14.2 Add loading states to components
    - Show loading spinners during API calls
    - Disable buttons during submission
    - _Requirements: 10.1_

## Notes

- Tasks marked with `*` are optional property-based tests
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- The implementation uses Java (Spring Boot) for backend and TypeScript (Angular) for frontend
