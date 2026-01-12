import { User } from './auth.models';
import { Room } from './room.model';

export type BookingStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export interface Booking {
  id: number;
  user: User;
  room: Room;
  startTime: string;
  endTime: string;
  status: BookingStatus;
}

export interface BookingRequest {
  roomId: number;
  startTime: string;
  endTime: string;
}
