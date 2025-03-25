/**
* showTime.entity.ts
* 
* This file defines the ShowTime entity using TypeORM decorators.
* It represents a showtime record in the database, including:
*  - A reference to the movie (via movie_id)
*  - Theater name
*  - Start and end times (stored as time only)
*  - Ticket price
* 
* This entity is mapped to the 'show_time' table (by default named after the class).
*/
import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class ShowTime {
    /**
    * Primary key for the showtime entity.
    * Auto-generated integer ID.
    */
    @PrimaryGeneratedColumn()
    id: number;

    /**
    * Foreign key referencing the associated movie.
    * Must be a valid movie ID.
    */
    @Column({type: 'int', nullable: false})
    movie_id: number;

    /**
    * Name of the theater where the showtime will be held.
    * Stored as text and cannot be null.
    */
    @Column({type: 'text', nullable: false})
    theater: string;

    /**
    * Start time of the show, stored in HH:mm format (PostgreSQL 'time' type).
    * Cannot be null.
    */
    @Column({ type: 'time', nullable: false })
    start_time: string;
  
    /**
    * End time of the show, stored in HH:mm format (PostgreSQL 'time' type).
    * Cannot be null.
    */
    @Column({ type: 'time', nullable: false })
    end_time: string;
  
    /**
    * Ticket price for the showtime.
    * Stored as a floating-point number and must be >= 0.
    */
    @Column({ type: 'float', nullable: false })
    price: number;
}