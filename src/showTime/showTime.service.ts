/**
* showTime.service.ts
*
* This service handles all business logic related to movie showtimes.
* It validates showtime creation and updates based on movie duration,
* overlapping times, and data integrity. It communicates with the
* 'ShowTimeRepository' for DB operations and relies on 'MovieRepository'
* to fetch movie details required for validation.
*/

import { Injectable, BadRequestException, NotFoundException, Inject } from "@nestjs/common";
import { ShowTimeRepository } from "./showTime.repository";
import { MovieRepository } from "src/Movie/movie.repository";
import { CreateShowTimeDto } from "./create-showTime.dto";
import { UpdateShowTimeDto } from "./update-showTime.dto";
import { Movie } from "src/Movie/movie.entity";
import { ShowTime } from "./showTime.entity";


@Injectable()
export class ShowTimeService {
    constructor(
        @Inject('ShowTimeRepository') private readonly showTimeRepository: ShowTimeRepository, 
        @Inject('MovieRepository') private readonly movieRepository: MovieRepository) {}

    /**
    * Calculates duration in minutes between two times (HH:mm).
    * @param startTime - Start time (HH:mm format)
    * @param endTime - End time (HH:mm format)
    * @returns Duration in minutes
    */
    private calculateDuration(startTime: string, endTime: string): number {
        const [startHour, startMinute] = startTime.split(':').map(Number);
        const [endHour, endMinute] = endTime.split(':').map(Number);

        const startTtoal = startHour * 60 + startMinute;
        const endTotal = endHour * 60 + endMinute;

        return endTotal - startTtoal;
    }

    /**
    * Adds a new showtime after performing all validations:
    * - Movie exists
    * - Valid time logic
    * - Duration matches movie
    * - No overlapping showtime
    * - No exact duplicate
    * 
    * @param newShowTime - The showtime data from client
    * @returns Promise<void>
    * @throws BadRequestException, NotFoundException
    */
    async addNewShowTime(newShowTime: CreateShowTimeDto): Promise<void> {
        const {movie_title, movie_release_year, theater, start_time, end_time, price} = newShowTime;

        if (price <= 0) {
            throw new BadRequestException("Price must be greater than 0.");
        }

        const movieName = movie_title.trim().toLowerCase();
        const theaterName = theater.trim().toLowerCase();

        const movie = await this.movieRepository.fetchMovieByTitleAndReleaseYear(movieName, movie_release_year);

        if (!movie) {
            throw new NotFoundException(`Movie with title "${movieName}" and release year "${movie_release_year}" not found.`);
        }

        const movie_id = movie.id;
        const movieDuration = movie.duration;

        if (start_time === end_time) {
            throw new BadRequestException("Start time and end time cannot be the same.");
        }

        if (start_time > end_time) {
            throw new BadRequestException("End time must be after start time.");
        }

        const showTimeDuration = this.calculateDuration(start_time, end_time);
        if (showTimeDuration !== movieDuration) {
            throw new BadRequestException(
                `Showtime duration must match movie duration (${movieDuration} minutes). You provided ${showTimeDuration} minutes.`);
        }

        const hasOverLap = await this.showTimeRepository.hasOverLappingShowTime(theaterName, start_time, end_time);
        if (hasOverLap) {
            throw new BadRequestException("Overlapping showtime exists for this theater.");
        }

        const existingShowTime = await this.showTimeRepository.findExactShowTime({
            movie_id, theater: theaterName, start_time, end_time, price
        });
        if (existingShowTime) {
            throw new BadRequestException("Showtime with the same details already exists.");
        }

        await this.showTimeRepository.addNewShowTime({movie_id, theater: theaterName, start_time, end_time, price});
    }

    /**
    * Validates that both title and release year are present for movie lookup.
    * 
    * @param updatesShowTime - Partial showtime update data
    * @returns Movie if found, null otherwise
    * @throws BadRequestException, NotFoundException
    */
    private async validateMovie(updatesShowTime: UpdateShowTimeDto): Promise<Movie | null> {
        if (updatesShowTime.movie_title && updatesShowTime.movie_release_year) {
            const movieName = updatesShowTime.movie_title.trim().toLowerCase();

            const movie = await this.movieRepository.fetchMovieByTitleAndReleaseYear(movieName, updatesShowTime.movie_release_year);
            if (!movie) {
                throw new NotFoundException(`Movie with title "${movieName}" and release year "${updatesShowTime.movie_release_year}" not found.`);
            }

            return movie;
        }

        else if (updatesShowTime.movie_title || updatesShowTime.movie_release_year) {
            throw new BadRequestException("To update the movie, both title and release year must be provided.");
        }

        return null;
    }

    /**
    * Merges the existing showtime with updates and optional new movie ID.
    * 
    * @param existingShowTime - Current DB showtime
    * @param updatesShowTime - Incoming update fields
    * @param movie_id - New or existing movie ID
    * @returns Updated showtime object
    */
    private createUpdatedShowTime(existingShowTime: ShowTime, updatesShowTime: UpdateShowTimeDto, movie_id: number): ShowTime {
        return {
            ...existingShowTime, movie_id, theater: updatesShowTime.theater?.trim().toLowerCase() ?? existingShowTime.theater,
            start_time: updatesShowTime.start_time ?? existingShowTime.start_time, end_time: updatesShowTime.end_time ?? existingShowTime.end_time,
            price: updatesShowTime.price ?? existingShowTime.price};
    }

    /**
    * Validates logical consistency of showtime time range and duration.
    * 
    * @param start - Start time (HH:mm)
    * @param end - End time (HH:mm)
    * @param expectedDuration - Movie duration in minutes
    * @throws BadRequestException
    */
    private validateTimeLogic(start: string, end: string, expectedDuration: number): void {
        if (start === end) {
            throw new BadRequestException("Start time and end time cannot be the same.");
        }

        if (start > end) {
            throw new BadRequestException("End time must be after start time.");
        }

        const actualDuration = this.calculateDuration(start, end);
        if (actualDuration !== expectedDuration) {
            throw new BadRequestException(`Showtime duration must match movie duration (${expectedDuration} minutes). You provided ${actualDuration} minutes.`);
        }
    }

    /**
    * Updates an existing showtime after validating:
    * - ID validity
    * - Movie updates (if any)
    * - Time/duration logic
    * - Overlap detection (if time or theater changed)
    * 
    * @param id - ID of showtime to update
    * @param updatesShowTime - Fields to update
    * @returns Promise<void>
    * @throws BadRequestException, NotFoundException
    */
    async updateShowTimeInfo(id: number, updatesShowTime: UpdateShowTimeDto): Promise<void> {
        if (!id || id <= 0) {
            throw new BadRequestException("Invalid showtime ID.");
        }

        const existingShowTime = await this.showTimeRepository.fetchShowTimeById(id);
        if (!existingShowTime) {
          throw new NotFoundException(`Showtime with ID ${id} not found.`);
        }

        const movie = await this.validateMovie(updatesShowTime);
        const movieId = movie ? movie.id : existingShowTime.movie_id;
        const duration = movie ? movie.duration : (await this.movieRepository.fetchMovieById(movieId))?.duration;

        if (!duration) {
            throw new NotFoundException("Movie duration could not be determined.");
        }

        const updtaedShowTime = this.createUpdatedShowTime(existingShowTime, updatesShowTime, movieId);

        if(updatesShowTime.price !== undefined && updatesShowTime.price <= 0) {
            throw new BadRequestException("Price must be greater than 0.");
        }

        this.validateTimeLogic(updtaedShowTime.start_time, updtaedShowTime.end_time, duration);

        const changedTime = updtaedShowTime.start_time !== existingShowTime.start_time ||
                                updtaedShowTime.end_time !== existingShowTime.end_time ||
                                updtaedShowTime.theater !== existingShowTime.theater;
        
        if (changedTime) {
            const hasOverLap = await this.showTimeRepository.hasOverLappingShowTime(updtaedShowTime.theater,
                updtaedShowTime.start_time, updtaedShowTime.end_time);
            
            if (hasOverLap) {
                throw new BadRequestException("Updated showtime overlaps with another showtime in this theater.");
            }
        }

        await this.showTimeRepository.updateShowTimeInfo(id, updtaedShowTime);
    }
    
    /**
    * Deletes a showtime if it exists.
    * 
    * @param id - ID of the showtime to delete
    * @returns Promise<void>
    * @throws BadRequestException, NotFoundException
    */
    async deleteShowTime(id: number): Promise<void> {
        if (!id || id <= 0) {
            throw new BadRequestException("Invalid showtime ID.");
        }

        const existingShowTime = await this.showTimeRepository.fetchShowTimeById(id);
        if (!existingShowTime) {
            throw new NotFoundException(`Showtime with ID ${id} not found.`);
        }

        await this.showTimeRepository.deleteShowTime(id);
    }

    /**
    * Fetches a showtime by its ID and includes the associated movie details.
    * 
    * @param id - Showtime ID
    * @returns A full showtime object with movie data
    * @throws BadRequestException, NotFoundException
    */
    async fetchShowTimeById(id: number): Promise<any> {
        if (!id || id <= 0) {
            throw new BadRequestException("Invalid showtime ID.");
        }

        const showtime = await this.showTimeRepository.fetchShowTimeById(id);
        if (!showtime) {
            throw new NotFoundException(`Showtime with ID ${id} not found.`);
        }

        const movie = await this.movieRepository.fetchMovieById(showtime.movie_id);
        if (!movie) {
            throw new NotFoundException(`Movie with ID ${showtime.movie_id} not found.`);
        }

        return {id: showtime.id, theater: showtime.theater, movie, start_time: showtime.start_time,
                end_time: showtime.end_time, price: showtime.price};
    }

}