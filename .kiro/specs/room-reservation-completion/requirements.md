# Requirements Document

## Introduction

This specification covers the completion of the Room Reservation System, including a responsive frontend redesign using the SESAME color palette (orange/red tones from the logo), missing backend functionality, and proper frontend-backend integration. The system allows users to authenticate, browse rooms, create bookings, and administrators to manage rooms and approve/reject bookings.

## Glossary

- **System**: The Room Reservation application comprising frontend and backend
- **User**: An authenticated person who can browse rooms and create bookings
- **Admin**: A user with elevated privileges to manage rooms and approve/reject bookings
- **Room**: A reservable space with name, capacity, location, and equipment
- **Booking**: A reservation request for a room during a specific time slot
- **SESAME_Palette**: Color scheme derived from the SESAME logo (primary blue #00478F, secondary teal #22C0C2, accent teal #21C0C2, dark blue #00488F)

## Requirements

### Requirement 1: Responsive UI Design with SESAME Branding

**User Story:** As a user, I want the application to have a professional, responsive design using SESAME brand colors, so that I can use it comfortably on any device.

#### Acceptance Criteria

1. THE System SHALL use the SESAME color palette with primary blue (#00478F), secondary teal (#22C0C2), and accent teal (#21C0C2)
2. WHEN the viewport width is less than 768px, THE System SHALL display a mobile-optimized layout with collapsible navigation
3. WHEN the viewport width is 768px or greater, THE System SHALL display a desktop layout with full navigation
4. THE System SHALL provide a sidebar navigation menu for authenticated users
5. THE System SHALL display the SESAME logo in the header/navigation area

### Requirement 2: Complete Navigation and Layout

**User Story:** As a user, I want a consistent navigation experience across all pages, so that I can easily access different features.

#### Acceptance Criteria

1. THE System SHALL display a responsive sidebar with navigation links to Dashboard, Rooms, My Bookings, and Admin sections
2. WHEN a user is not an admin, THE System SHALL hide admin-only navigation items
3. WHEN a user clicks the mobile menu toggle, THE System SHALL show/hide the sidebar navigation
4. THE System SHALL highlight the currently active navigation item
5. THE System SHALL display the logged-in user's name and role in the navigation area

### Requirement 3: Enhanced Dashboard

**User Story:** As a user, I want to see relevant statistics and my recent bookings on the dashboard, so that I can quickly understand my reservation status.

#### Acceptance Criteria

1. WHEN a user views the dashboard, THE System SHALL display statistics cards showing total rooms, user's bookings count, and pending bookings
2. WHEN a user views the dashboard, THE System SHALL display a list of their recent bookings with status indicators
3. THE System SHALL use color-coded status badges (pending: orange, approved: green, rejected: red)
4. WHEN a user is an admin, THE System SHALL display additional admin statistics (total users, all pending bookings)

### Requirement 4: Room Management Interface

**User Story:** As an admin, I want to manage rooms through a complete CRUD interface, so that I can maintain the room catalog.

#### Acceptance Criteria

1. THE System SHALL display rooms in a responsive card/grid layout on mobile and table on desktop
2. WHEN an admin clicks edit on a room, THE System SHALL display a form pre-filled with room data
3. WHEN an admin submits a room update, THE System SHALL persist changes and refresh the list
4. WHEN an admin clicks delete on a room, THE System SHALL prompt for confirmation before deletion
5. THE System SHALL display room equipment as visual tags/chips

### Requirement 5: Booking Management

**User Story:** As a user, I want to view and manage my bookings, so that I can track my reservations.

#### Acceptance Criteria

1. THE System SHALL provide a "My Bookings" page listing all user's bookings with room details and status
2. WHEN a booking is pending, THE System SHALL allow the user to cancel it
3. THE System SHALL display booking time in a user-friendly format
4. WHEN an admin views all bookings, THE System SHALL provide approve/reject actions for pending bookings

### Requirement 6: Admin Booking Approval Interface

**User Story:** As an admin, I want to approve or reject booking requests, so that I can manage room usage.

#### Acceptance Criteria

1. THE System SHALL provide an admin page listing all pending bookings
2. WHEN an admin approves a booking, THE System SHALL update the status to APPROVED and refresh the list
3. WHEN an admin rejects a booking, THE System SHALL update the status to REJECTED and refresh the list
4. THE System SHALL display requester information alongside booking details

### Requirement 7: Backend User Profile Endpoint

**User Story:** As a frontend developer, I want a user profile endpoint, so that I can display user information and role.

#### Acceptance Criteria

1. WHEN an authenticated request is made to GET /api/v1/users/me, THE System SHALL return the current user's profile (id, email, firstName, lastName, role)
2. THE System SHALL not expose the password hash in the response

### Requirement 8: Backend Booking Cancellation

**User Story:** As a user, I want to cancel my pending bookings through the API, so that I can free up room slots.

#### Acceptance Criteria

1. WHEN a user sends DELETE /api/v1/bookings/{id}, THE System SHALL cancel the booking if it belongs to the user and is PENDING
2. IF a user attempts to cancel another user's booking, THEN THE System SHALL return 403 Forbidden
3. IF a user attempts to cancel an approved/rejected booking, THEN THE System SHALL return 400 Bad Request

### Requirement 9: Frontend Services Layer

**User Story:** As a developer, I want centralized Angular services for API communication, so that components don't have hardcoded URLs.

#### Acceptance Criteria

1. THE System SHALL provide a RoomService with methods for getAllRooms, getRoomById, createRoom, updateRoom, deleteRoom
2. THE System SHALL provide a BookingService with methods for createBooking, getMyBookings, cancelBooking, getAllBookings (admin), approveBooking (admin), rejectBooking (admin)
3. THE System SHALL provide a UserService with method for getCurrentUser
4. THE System SHALL use environment configuration for API base URL

### Requirement 10: Error Handling and User Feedback

**User Story:** As a user, I want clear feedback when actions succeed or fail, so that I understand the system state.

#### Acceptance Criteria

1. WHEN an API call fails, THE System SHALL display a user-friendly error message
2. WHEN an action succeeds (booking created, room saved), THE System SHALL display a success notification
3. THE System SHALL use a consistent notification/toast component for feedback
