/**
 * booking.module.ts
 * 
 * This module is responsible for managing the booking-related feature of the application.
 * It wires together the controller, service, repository, and entity related to movie ticket bookings.
 * 
 * It imports:
 * - TypeORM for database access to the Booking entity
 * - ShowTimeModule for showtime validation
 * - MovieModule for movie validation
 * 
 * This module:
 * - Registers 'BookingController' to handle HTTP requests
 * - Provides 'BookingService' and 'BookingRepository' for business and data access logic
 * - Exports 'BookingService' for reuse in other modules
 */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking } from './booking.entity';
import { BookingController } from './booking.controller';
import { BookingService } from './booking.service';
import { BookingRepository } from './booking.repository';
import { ShowTimeModule } from 'src/showTime/showTime.module';
import { MovieModule } from 'src/movie/movie.module';

@Module({
  imports: [TypeOrmModule.forFeature([Booking]), ShowTimeModule, MovieModule],
  controllers: [BookingController],
  providers: [BookingService, BookingRepository],
  exports: [BookingService]
})
export class BookingModule {
  constructor() {
    console.log('BookingModule loaded');
  }
}
