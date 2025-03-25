/**
 * showTime.service.ts
 *
 * This service handles business logic for creating, updating, fetching, and deleting movie showtimes.
 * It validates against movie duration, prevents overlaps, and ensures time integrity.
 */

import { Injectable, BadRequestException, NotFoundException, Inject } from "@nestjs/common";
import { ShowTimeRepository } from "./showTime.repository";
import { MovieRepository } from "../movie/movie.repository";
import { ShowTimeDto } from "./showTime.dto";
import { ShowTime } from "./showTime.entity";

@Injectable()
export class ShowTimeService {
    constructor(
        @Inject('ShowTimeRepository') private readonly showTimeRepository: ShowTimeRepository,
        @Inject('MovieRepository') private readonly movieRepository: MovieRepository
    ) {}

    /**
     * Calculates the time difference in minutes between two ISO date strings.
     */
    private calculateDuration(start: string, end: string): number {
        const startDate = new Date(start);
        const endDate = new Date(end);
        return (endDate.getTime() - startDate.getTime()) / (1000 * 60);
    }

    /**
     * Adds a new showtime after validating:
     * - Valid movie ID
     * - Valid time range
     * - Duration matches movie
     * - No overlapping showtime
     * 
     * @param data - New showtime input
     * @returns The newly created showtime
     */
    async addNewShowTime(data: ShowTimeDto): Promise<ShowTime> {
        const { movieId, theater, startTime, endTime, price } = data;

        if (price <= 0) {
            throw new BadRequestException("Price must be greater than 0.");
        }

        const movie = await this.movieRepository.fetchMovieById(movieId);
        if (!movie) {
            throw new NotFoundException(`Movie with ID ${movieId} not found.`);
        }

        if (new Date(startTime) >= new Date(endTime)) {
            throw new BadRequestException("End time must be after start time.");
        }

        const actualDuration = this.calculateDuration(startTime, endTime);
        if (actualDuration !== movie.duration) {
            throw new BadRequestException(`Showtime duration must match movie duration (${movie.duration} minutes). You provided ${actualDuration} minutes.`);
        }

        const overlap = await this.showTimeRepository.hasOverlappingShowTime(theater.trim(), startTime, endTime);
        if (overlap) {
            throw new BadRequestException("An overlapping showtime already exists in this theater.");
        }

        const newShowTime: Omit<ShowTime, 'id'> = {
            movieId,
            theater: theater.trim(),
            startTime,
            endTime,
            price
        };

        return await this.showTimeRepository.addNewShowTime(newShowTime);
    }

    /**
     * Updates a showtime after performing all relevant validations.
     * 
     * @param id - Showtime ID to update
     * @param dto - Fields to update
     */
    async updateShowTimeInfo(id: number, dto: ShowTimeDto): Promise<void> {
        if (!id || id <= 0) {
            throw new BadRequestException("Invalid showtime ID.");
        }

        const existing = await this.showTimeRepository.fetchShowTimeById(id);
        if (!existing) {
            throw new NotFoundException(`Showtime with ID ${id} not found.`);
        }

        const updated: ShowTime = {
            ...existing,
            movieId: dto.movieId ?? existing.movieId,
            theater: dto.theater?.trim() ?? existing.theater,
            startTime: dto.startTime ?? existing.startTime,
            endTime: dto.endTime ?? existing.endTime,
            price: dto.price ?? existing.price,
            id
        };

        if (updated.price <= 0) {
            throw new BadRequestException("Price must be greater than 0.");
        }

        const movie = await this.movieRepository.fetchMovieById(updated.movieId);
        if (!movie) {
            throw new NotFoundException(`Movie with ID ${updated.movieId} not found.`);
        }

        if (new Date(updated.startTime) >= new Date(updated.endTime)) {
            throw new BadRequestException("End time must be after start time.");
        }

        const actualDuration = this.calculateDuration(updated.startTime, updated.endTime);
        if (actualDuration !== movie.duration) {
            throw new BadRequestException(`Showtime duration must match movie duration (${movie.duration} minutes). You provided ${actualDuration} minutes.`);
        }

        const changedTimeOrTheater =
            updated.startTime !== existing.startTime ||
            updated.endTime !== existing.endTime ||
            updated.theater !== existing.theater;

        if (changedTimeOrTheater) {
            const overlap = await this.showTimeRepository.hasOverlappingShowTime(
                updated.theater,
                updated.startTime,
                updated.endTime,
                id
            );
        

            if (overlap) {
                throw new BadRequestException("Updated showtime overlaps with another showtime in this theater.");
            }
        }

        await this.showTimeRepository.updateShowTimeInfo(id, updated);
    }

    /**
     * Deletes a showtime by its ID.
     */
    async deleteShowTime(id: number): Promise<void> {
        if (!id || id <= 0) {
            throw new BadRequestException("Invalid showtime ID.");
        }

        const existing = await this.showTimeRepository.fetchShowTimeById(id);
        if (!existing) {
            throw new NotFoundException(`Showtime with ID ${id} not found.`);
        }

        await this.showTimeRepository.deleteShowTime(id);
    }

    /**
     * Fetches a showtime by its ID.
     */
    async fetchShowTimeById(id: number): Promise<ShowTime> {
        if (!id || id <= 0) {
            throw new BadRequestException("Invalid showtime ID.");
        }

        const showtime = await this.showTimeRepository.fetchShowTimeById(id);
        if (!showtime) {
            throw new NotFoundException(`Showtime with ID ${id} not found.`);
        }

        return showtime;
    }
}
