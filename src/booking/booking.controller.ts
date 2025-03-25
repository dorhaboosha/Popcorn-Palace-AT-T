/**
 * booking.controller.ts
 *
 * This controller handles HTTP requests related to booking operations.
 * 
 * Currently, it exposes a single POST endpoint to create a new booking
 * for a specific movie showtime and seat. Validation is handled by BookingDto.
 * 
 * Route: POST /bookings
 */

import { Controller, Post, Body } from '@nestjs/common';
import { BookingService } from './booking.service';
import { BookingDto } from './booking.dto';

@Controller('bookings')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  /**
   * POST /bookings
   * 
   * Books a seat for a specific showtime.
   * 
   * @param bookingData - The request body containing showtimeId, seatNumber, and userId
   * @returns The booking ID of the newly created booking
   * 
   * @throws BadRequestException if:
   * - seat is already booked
   * - theater is full
   * - duplicate booking
   * 
   * @throws NotFoundException if:
   * - showtime does not exist
   * - movie does not exist
   * 
   * @throws InternalServerErrorException for unexpected database/server errors
   */
  @Post()
  async addNewBooking(@Body() bookingData: BookingDto): Promise<{ bookingId: string }> {
    return await this.bookingService.addNewBooking(bookingData);
  }
}
