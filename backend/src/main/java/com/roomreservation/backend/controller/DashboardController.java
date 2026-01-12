package com.roomreservation.backend.controller;

import com.roomreservation.backend.entity.Booking;
import com.roomreservation.backend.entity.BookingStatus;
import com.roomreservation.backend.entity.Role;
import com.roomreservation.backend.entity.User;
import com.roomreservation.backend.repository.BookingRepository;
import com.roomreservation.backend.repository.RoomRepository;
import com.roomreservation.backend.repository.UserRepository;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final UserRepository userRepository;
    private final RoomRepository roomRepository;
    private final BookingRepository bookingRepository;

    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DashboardStats> getStats() {
        return ResponseEntity.ok(DashboardStats.builder()
                .totalUsers(userRepository.count())
                .totalRooms(roomRepository.count())
                .totalBookings(bookingRepository.count())
                .build());
    }

    @GetMapping("/user-stats")
    public ResponseEntity<UserDashboardStats> getUserStats(@AuthenticationPrincipal User currentUser) {
        List<Booking> userBookings = bookingRepository.findByUserId(currentUser.getId());
        
        long myBookingsCount = userBookings.size();
        long myPendingCount = userBookings.stream()
                .filter(b -> b.getStatus() == BookingStatus.PENDING)
                .count();
        
        // Get last 5 bookings sorted by startTime descending
        List<RecentBookingDTO> recentBookings = userBookings.stream()
                .sorted((b1, b2) -> b2.getStartTime().compareTo(b1.getStartTime()))
                .limit(5)
                .map(this::toRecentBookingDTO)
                .collect(Collectors.toList());
        
        UserDashboardStats.UserDashboardStatsBuilder builder = UserDashboardStats.builder()
                .totalRooms(roomRepository.count())
                .myBookingsCount(myBookingsCount)
                .myPendingCount(myPendingCount)
                .recentBookings(recentBookings);
        
        // Add admin-only stats if user is admin
        if (currentUser.getRole() == Role.ADMIN) {
            long allPendingCount = bookingRepository.findAll().stream()
                    .filter(b -> b.getStatus() == BookingStatus.PENDING)
                    .count();
            builder.totalUsers(userRepository.count())
                   .allPendingCount(allPendingCount)
                   .isAdmin(true);
        } else {
            builder.isAdmin(false);
        }
        
        return ResponseEntity.ok(builder.build());
    }
    
    private RecentBookingDTO toRecentBookingDTO(Booking booking) {
        return RecentBookingDTO.builder()
                .id(booking.getId())
                .roomName(booking.getRoom().getName())
                .startTime(booking.getStartTime().toString())
                .endTime(booking.getEndTime().toString())
                .status(booking.getStatus().name())
                .build();
    }

    @Data
    @Builder
    public static class DashboardStats {
        private long totalUsers;
        private long totalRooms;
        private long totalBookings;
    }
    
    @Data
    @Builder
    public static class UserDashboardStats {
        private long totalRooms;
        private long myBookingsCount;
        private long myPendingCount;
        private List<RecentBookingDTO> recentBookings;
        // Admin-only fields
        private Long totalUsers;
        private Long allPendingCount;
        private boolean isAdmin;
    }
    
    @Data
    @Builder
    public static class RecentBookingDTO {
        private Long id;
        private String roomName;
        private String startTime;
        private String endTime;
        private String status;
    }
}
