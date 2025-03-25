/**
 * ticket.entity.ts
 * 
 * This entity defines the structure of the `Ticket` table in the database.
 * Each ticket represents a customer's booking for a specific seat in a given showtime.
 * 
 * Used by TypeORM for database operations, and mapped directly to the "ticket" table.
 */

import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Ticket {
  
  /**
  * Auto-generated unique ID for the ticket (primary key).
  */
  @PrimaryGeneratedColumn()
  id: number;

  /**
  * Foreign key reference to the movie being watched.
  * (Used for validation purposes only; not a relation here.)
  */
  @Column({type: 'int', nullable: false})
  movie_id: number;

  /**
  * Foreign key reference to the associated showtime.
  */
  @Column({type: 'int', nullable: false})
  showtime_id: number;

  /**
  * The seat number booked by the customer (1–100).
  */
  @Column({type: 'int', nullable: false})
  seat_number: number;

  /**
  * Full name of the customer who booked the ticket.
  */
  @Column({type: 'varchar', length: 100, nullable: false})
  customer_name: string;
}