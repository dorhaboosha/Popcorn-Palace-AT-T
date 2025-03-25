/**
 * booking.dto.ts
 * 
 * This Data Transfer Object (DTO) defines the structure and validation rules
 * for creating a new booking in the system.
 * 
 * It ensures that all required fields are present and properly validated before
 * proceeding with the booking process. This DTO is used in the BookingService
 * and BookingController to handle client POST requests.
 */

import { IsUUID, IsInt, IsNotEmpty, Min, Max } from "class-validator";

export class BookingDto {
  
  /**
   * UUID of the user making the booking.
   * Must be a valid UUID string.
   */
  @IsUUID(undefined, { message: 'User ID must be a valid UUID.' })
  userId: string;

  /**
   * ID of the showtime the user wants to book.
   * Must be a positive integer.
   */
  @IsInt({ message: "Showtime ID must be a valid number." })
  @Min(1, { message: "Showtime ID must be greater than 0." })
  showtimeId: number;

  /**
   * Seat number for the booking (1–100).
   */
  @IsInt({ message: "Seat number must be a valid number." })
  @Min(1, { message: "Seat number must be at least 1." })
  @Max(100, { message: "Seat number must be at most 100." })
  seatNumber: number;
}
