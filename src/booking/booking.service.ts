/**
 * booking.service.ts
 *
 * This service handles the business logic for booking seats in the movie showtime system.
 * It verifies:
 * - The showtime exists
 * - The movie for that showtime exists
 * - The seat is not already booked
 * - The theater is not full (100 seats max)
 * - The same user hasn't already booked the same seat
 * 
 * If all checks pass, a new booking is inserted into the database.
 */

import { Injectable, BadRequestException, NotFoundException, Inject } from '@nestjs/common';
import { BookingRepository } from './booking.repository';
import { ShowTimeRepository } from 'src/showTime/showTime.repository';
import { MovieRepository } from 'src/movie/movie.repository';
import { BookingDto } from './booking.dto';
import { Booking } from './booking.entity';

@Injectable()
export class BookingService {
  constructor(
    private readonly bookingRepository: BookingRepository,
    @Inject('ShowTimeRepository') private readonly showTimeRepository: ShowTimeRepository,
    @Inject('MovieRepository') private readonly movieRepository: MovieRepository,
  ) {}

  /**
   * Creates and stores a new booking after validating all business constraints.
   * 
   * @param data - Booking data (showtimeId, seatNumber, userId)
   * @returns the bookingId (UUID) of the newly created booking
   */
  async addNewBooking(data: BookingDto): Promise<{ bookingId: string }> {
    const { showtimeId, seatNumber, userId } = data;

    // Validate showtime
    const showtime = await this.showTimeRepository.fetchShowTimeById(showtimeId);
    if (!showtime) {
      throw new NotFoundException(`Showtime with ID ${showtimeId} not found.`);
    }

    // Validate movie associated with the showtime
    const movie = await this.movieRepository.fetchMovieById(showtime.movieId); 
    if (!movie) {
      throw new NotFoundException(`Movie with ID ${showtime.movieId} not found.`);
    }

    // Check if the theater is full (100 seats max)
    const isFull = await this.bookingRepository.isTheaterFull(showtimeId);
    if (isFull) {
      throw new BadRequestException(`The theater is full. No seats available for this showtime.`);
    }

    // Check if this user already booked this seat
    const allBookings = await this.bookingRepository.getBookingsForShowTime(showtimeId);
    const duplicate = allBookings.find(b => b.userId === userId && b.seatNumber === seatNumber);
    if (duplicate) {
      throw new BadRequestException(`User has already booked seat ${seatNumber} for this showtime.`);
    }

    // Check if seat is already taken
    const isTaken = await this.bookingRepository.isSeatTaken(showtimeId, seatNumber);
    if (isTaken) {
      throw new BadRequestException(`Seat number ${seatNumber} is already booked for this showtime.`);
    }

    // Create and insert booking
    const booking: Booking = {
      showtimeId,
      seatNumber,
      userId
    } as Booking;

    const bookingId = await this.bookingRepository.addNewBooking(booking);
    return { bookingId };
  }
}
