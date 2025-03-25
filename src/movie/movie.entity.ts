/**
* movie.entity.ts
* 
* This entity defines the structure of the "movie" table in the PostgreSQL database.
* Each instance of the Movie class represents a row in the table.
* This class is used by TypeORM for data persistence and retrieval.
*/

import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Movie {
    
    /**
    * The unique ID of the movie (auto-generated).
    */
    @PrimaryGeneratedColumn()
    id: number;

    /**
    * The title of the movie.
    * - Must be a non-null string.
    */
    @Column({type: 'text', nullable: false})
    title: string;

    /**
    * The genre of the movie (e.g., Action, Comedy).
    * - Must be a non-null string.
    */
    @Column({type: 'text', nullable: false})
    genre: string;

    /**
    * The duration of the movie in minutes.
    * - Must be a non-null integer.
    */
    @Column({ type: 'int', nullable: false })
    duration: number;

    /**
    * The rating of the movie (from 0 to 10).
    * - Must be a non-null float value.
    */
    @Column({ type: 'float', nullable: false })
    rating: number;
    
    /**
    * The year the movie was released.
    * - Must be a non-null integer (e.g., 2024).
    */
    @Column({ type: 'int', nullable: false })
    release_year: number;
}