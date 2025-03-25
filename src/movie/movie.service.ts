/**
* movie.service.ts
* 
* This file defines the MovieService class, which provides core business logic for managing movie records.
* It includes functionality to add, update, delete, and fetch movies, while ensuring proper validation,
* normalization (trimming/lowercasing), and error handling. The service interacts with the MovieRepository
* to access the data layer and throws appropriate exceptions for invalid input or business rule violations.
*/

import { Injectable, BadRequestException, NotFoundException, Inject } from "@nestjs/common";
import { MovieRepository } from "./movie.repository";
import { Movie } from "./movie.entity";
import { MovieDto } from "./movie.dto";

@Injectable()
export class MovieService {
    constructor(@Inject('MovieRepository') private readonly movieRepository: MovieRepository) {}

    /**
    * Adds a new movie to the repository.
    * 
    * - Trims and lowercases the title and genre.
    * - Checks for duplicates by title.
    * 
    * @param dto - The movie to add (validated by DTO).
    * @throws BadRequestException if a duplicate movie is found.
    */
    async addNewMovie(movieData: MovieDto): Promise<void> {
        const movieTitle = movieData.title.trim().toLowerCase();
        const movieGenre = movieData.genre.trim().toLowerCase();

        const existingMovie = await this.movieRepository.findMovieByTitle(movieTitle);
        if (existingMovie) {
            throw new BadRequestException(`A movie titled "${movieTitle}" already exists.`);
        }

        return this.movieRepository.addNewMovie({ title: movieTitle, genre: movieGenre, 
            duration: movieData.duration,rating: movieData.rating, releaseYear: movieData.releaseYear});
    }

    /**
    * Updates an existing movie's information by its current title.
    * 
    * - Validates that the movie exists.
    * - Checks for duplicate title if being changed.
    * - Trims and lowercases string fields before update.
    * 
    * @param title - The current title of the movie.
    * @param dto - The updated movie data.
    * @throws BadRequestException if data is invalid or duplicate title found.
    * @throws NotFoundException if the movie does not exist.
    */
    async updateMovieInfo(title: string, movieData: MovieDto): Promise<void> {
        const originalTitle = title.trim().toLowerCase();

        const existingMovie = await this.movieRepository.findMovieByTitle(originalTitle);
        if (!existingMovie) {
            throw new NotFoundException(`Movie titled "${originalTitle}" not found.`);
        }

        const updatedTitle = movieData.title.trim().toLowerCase();

        // If title is being changed, check for conflicts
        if (updatedTitle !== originalTitle) {
            const duplicate = await this.movieRepository.findMovieByTitle(updatedTitle);
            if (duplicate) {
                throw new BadRequestException(`A movie titled "${updatedTitle}" already exists.`);
            }
        }

        return this.movieRepository.updateMovieInfo(originalTitle, { title: updatedTitle, genre: movieData.genre.trim().toLowerCase(),
            duration: movieData.duration, rating: movieData.rating, releaseYear: movieData.releaseYear});
    }

    /**
    * Deletes a movie by its title.
    * 
    * @param title - The title of the movie to delete.
    * @throws NotFoundException if movie does not exist.
    */
    async deleteMovie(title: string): Promise<void> {
        const movieTitle = title.trim().toLowerCase();

        const existing = await this.movieRepository.findMovieByTitle(movieTitle);
        if (!existing) {
            throw new NotFoundException(`Movie titled "${movieTitle}" not found.`);
        }

        return this.movieRepository.deleteMovie(movieTitle);
    }

    /**
    * Fetches all movies from the database.
    * 
    * @returns An array of movies.
    * @throws BadRequestException if no movies exist.
    */
    async fetchAllMovies(): Promise<Movie[]> {
        const movies = await this.movieRepository.getAllMovies();
        if (!movies || movies.length === 0) {
            throw new BadRequestException("There are no movies.");
        }
        return movies;
    }
}