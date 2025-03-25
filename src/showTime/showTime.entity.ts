/**
* showtime.entity.ts
* 
* This file defines the ShowTime entity using TypeORM decorators.
* It represents a showtime record in the database, including:
*  - A reference to the movie (via movieId)
*  - Theater name
*  - Start and end times (stored as time only)
*  - Ticket price
* 
* This entity is mapped to the 'showtimes' table.
*/

import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity('showtimes')
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
    @Column({name: 'movie_id', type: 'int', nullable: false })
    movieId: number;

    /**
    * Name of the theater where the showtime will be held.
    * Stored as text and cannot be null.
    */
    @Column({ type: 'text', nullable: false })
    theater: string;

    /**
    * Start time of the show.
    * Cannot be null.
    */
    @Column({ type: 'timestamp', nullable: false })
    startTime: string;

    /**
    * End time of the show.
    * Cannot be null.
    */
    @Column({ type: 'timestamp', nullable: false })
    endTime: string;

    /**
    * Ticket price for the showtime.
    * Stored as a floating-point number and must be >= 0.
    */
    @Column({ type: 'float', nullable: false })
    price: number;
}
