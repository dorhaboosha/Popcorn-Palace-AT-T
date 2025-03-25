/**
* showtime.dto.ts
*
* This file defines the Data Transfer Object (DTO) for creating or updating a showtime entry.
* It ensures the payload includes a valid movieId, ISO date-time formatted start/end times,
* a non-empty theater name, and a non-negative price.
*/

import { IsInt, IsString, IsNotEmpty, IsDateString, IsNumber, Min } from 'class-validator';

export class ShowTimeDto {
    /**
    * ID of the movie associated with this showtime.
    * Must be a valid positive integer.
    */
    @IsInt({ message: 'Movie ID must be an integer.' })
    @Min(1, { message: 'Movie ID must be greater than 0.' })
    movieId: number;

    /**
    * Name of the theater hosting the showtime.
    * Cannot be empty and must be a valid string.
    */
    @IsString({ message: 'Theater must be a string.' })
    @IsNotEmpty({ message: 'Theater is required.' })
    theater: string;

    /**
    * Start time of the show in ISO 8601 format.
    */
    @IsDateString({}, { message: 'Start time must be a valid date-time string.' })
    @IsNotEmpty({ message: 'Start time is required.' })
    startTime: string;

    /**
    * End time of the show in ISO 8601 format.
    */
    @IsDateString({}, { message: 'End time must be a valid date-time string.' })
    @IsNotEmpty({ message: 'End time is required.' })
    endTime: string;

    /**
    * Ticket price for the showtime.
    * Must be a non-negative number.
    */
    @IsNumber({}, { message: 'Price must be a valid number.' })
    @Min(0, { message: 'Price must be at least 0.' })
    price: number;
}
