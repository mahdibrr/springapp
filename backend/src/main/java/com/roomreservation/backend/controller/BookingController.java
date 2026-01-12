package com.roomreservation.backend.controller;

import com.roomreservation.backend.entity.Booking;
import com.roomreservation.backend.entity.BookingStatus;
import com.roomreservation.backend.service.BookingService;
import com.roomreservation.backend.service.JwtService;
import com.roomreservation.backend.entity.User;
import com.roomreservation.backend.repository.UserRepository;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/v1/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService service;
    private final UserRepository userRepository;

    @PostMapping
    public ResponseEntity<Booking> createBooking(@RequestBody BookingRequest request) {
        // Get current user from security context
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentPrincipalName = authentication.getName(); // email
        User user = userRepository.findByEmail(currentPrincipalName).orElseThrow();

        return ResponseEntity.ok(
                service.createBooking(user.getId(), request.getRoomId(), request.getStartTime(), request.getEndTime()));
    }

    @GetMapping("/my")
    public ResponseEntity<List<Booking>> getMyBookings() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentPrincipalName = authentication.getName();
        User user = userRepository.findByEmail(currentPrincipalName).orElseThrow();
        return ResponseEntity.ok(service.getUserBookings(user.getId()));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Booking>> getAllBookings() {
        return ResponseEntity.ok(service.getAllBookings());
    }

    @PatchMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Booking> approveBooking(@PathVariable Long id) {
        return ResponseEntity.ok(service.approveBooking(id));
    }

    @PatchMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Booking> rejectBooking(@PathVariable Long id) {
        return ResponseEntity.ok(service.rejectBooking(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancelBooking(@PathVariable Long id) {
        // Get current user from security context
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentPrincipalName = authentication.getName();
        User currentUser = userRepository.findByEmail(currentPrincipalName).orElseThrow();

        // Get the booking
        Booking booking = service.getBookingById(id);

        // Validate booking belongs to current user
        if (!booking.getUser().getId().equals(currentUser.getId())) {
            return ResponseEntity.status(403).build();
        }

        // Validate booking status is PENDING
        if (booking.getStatus() != BookingStatus.PENDING) {
            return ResponseEntity.badRequest().build();
        }

        // Cancel the booking
        service.cancelBooking(id);
        return ResponseEntity.noContent().build();
    }

    @Data
    public static class BookingRequest {
        private Long roomId;
        private LocalDateTime startTime;
        private LocalDateTime endTime;
    }
}
