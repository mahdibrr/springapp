package com.roomreservation.backend.service;

import com.roomreservation.backend.entity.Room;
import com.roomreservation.backend.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class RoomService {

    private final RoomRepository repository;

    public List<Room> getAllRooms() {
        return repository.findAll();
    }

    public Optional<Room> getRoomById(Long id) {
        return repository.findById(id);
    }

    public Room saveRoom(Room room) {
        return repository.save(room);
    }

    public void deleteRoom(Long id) {
        repository.deleteById(id);
    }

    public Room updateRoom(Long id, Room roomDetails) {
        Room room = repository.findById(id).orElseThrow();
        room.setName(roomDetails.getName());
        room.setCapacity(roomDetails.getCapacity());
        room.setLocation(roomDetails.getLocation());
        room.setEquipments(roomDetails.getEquipments());
        return repository.save(room);
    }
}
