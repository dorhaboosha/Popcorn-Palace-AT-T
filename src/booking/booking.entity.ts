/**
 * booking.entity.ts
 * 
 * This entity defines the structure of the `bookings` table in the database.
 * Each booking represents a customer's reservation for a specific seat in a showtime.
 * 
 * Used by TypeORM for database operations, and mapped directly to the "bookings" table.
 */

import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity({ name: 'bookings' })
export class Booking {
  
  /**
  * Auto-generated unique ID for the booking (primary key).
  */
  @PrimaryGeneratedColumn('uuid')
  bookingId: string;

  /**
  * Foreign key reference to the associated showtime.
  */
  @Column({ type: 'int', nullable: false })
  showtimeId: number;

  /**
  * The seat number booked by the customer (1–100).
  */
  @Column({ type: 'int', nullable: false })
  seatNumber: number;

  /**
  * UUID of the user who booked the ticket.
  */
  @Column({ type: 'uuid', nullable: false })
  userId: string;
}
