/**
 * booking.repository.ts
 *
 * This repository provides raw SQL-based access to the `bookings` table in the database.
 * It includes logic to:
 * - Add a new booking
 * - Check if a specific seat is already booked
 * - Check if a theater is full for a given showtime (100 seats max)
 * - Retrieve all bookings for a specific showtime
 */

import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Booking } from './booking.entity';

@Injectable()
export class BookingRepository {
  constructor(private readonly dataSource: DataSource) {}

  /**
   * Adds a new booking to the database.
   * 
   * @param booking - A complete `Booking` object (showtimeId, seatNumber, userId)
   * @returns bookingId (UUID)
   */
  async addNewBooking(booking: Booking): Promise<string> {
    try {
      const result = await this.dataSource.query(
        `INSERT INTO bookings ("showtimeId", "seatNumber", "userId")
         VALUES ($1, $2, $3)
         RETURNING "bookingId"`,
        [booking.showtimeId, booking.seatNumber, booking.userId]);

      return result[0]?.bookingId;
    } 
    catch (error) {
      console.error('DB Error on addNewBooking:', error);
      throw new InternalServerErrorException('Failed to add booking to the database.');
    }
  }

  /**
   * Checks if the given seat is already booked for the specified showtime.
   * 
   * @param showtimeId - The showtime ID
   * @param seatNumber - The seat number
   * @returns true if seat is already taken, false otherwise
   */
  async isSeatTaken(showtimeId: number, seatNumber: number): Promise<boolean> {
    try {
      const result = await this.dataSource.query(
        `SELECT 1 FROM bookings WHERE "showtimeId" = $1 AND "seatNumber" = $2`,
        [showtimeId, seatNumber]);
      return result.length > 0;
    } 
    catch (error) {
      console.error('DB Error on isSeatTaken:', error);
      throw new InternalServerErrorException('Failed to check if seat is already booked.');
    }
  }

  /**
   * Checks if the theater is fully booked for the given showtime (100 seats max).
   * 
   * @param showtimeId - The showtime ID
   * @returns true if fully booked, false otherwise
   */
  async isTheaterFull(showtimeId: number): Promise<boolean> {
    try {
      const result = await this.dataSource.query(
        `SELECT COUNT(*)::int AS count FROM bookings WHERE "showtimeId" = $1`,
        [showtimeId]);
      return result[0]?.count >= 100;
    } 
    catch (error) {
      console.error('DB Error on isTheaterFull:', error);
      throw new InternalServerErrorException('Failed to check if theater is full.');
    }
  }

  /**
   * Fetches all bookings for a given showtime.
   * 
   * @param showtimeId - The showtime ID
   * @returns list of Booking records
   */
  async getBookingsForShowTime(showtimeId: number): Promise<Booking[]> {
    try {
      return await this.dataSource.query(
        `SELECT * FROM bookings WHERE "showtimeId" = $1`,
        [showtimeId]);
    } 
    catch (error) {
      console.error('DB Error on getBookingsForShowTime:', error);
      throw new InternalServerErrorException('Failed to fetch bookings for showtime.');
    }
  }
}
