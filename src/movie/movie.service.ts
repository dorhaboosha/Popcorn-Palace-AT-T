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


@Injectable()
export class MovieService{
    constructor(@Inject('MovieRepository') private readonly movieRepository: MovieRepository) {}

    /**
    * Adds a new movie to the repository.
    * 
    * - Trims and lowercases the title and genre.
    * - Checks for duplicates by title and release year.
    * 
    * @param newMovie - The movie to add (excluding ID).
    * @returns A promise that resolves when the movie is successfully added.
    * @throws BadRequestException if a duplicate movie is found.
    */
    async addNewMovie(newMovie: Omit<Movie, 'id'>): Promise<void> {
        if (typeof newMovie.title === 'string') {
            newMovie.title = newMovie.title.trim();
            newMovie.title = newMovie.title.toLowerCase();
        }
        
        if (typeof newMovie.genre === 'string') {
            newMovie.genre = newMovie.genre.trim();
            newMovie.genre = newMovie.genre.toLowerCase();
        }

        const existingMovie = await this.movieRepository.fetchMovieByTitleAndReleaseYear(newMovie.title, newMovie.release_year);
        
        if (existingMovie) {
            throw new BadRequestException (`A movie titled "${newMovie.title}" already exists for year ${newMovie.release_year}.`);
        }

        return this.movieRepository.addNewMovie(newMovie);
    }

    /**
    * Updates an existing movie's information by its ID.
    * 
    * - Validates that the ID is positive and the movie exists.
    * - Requires at least one field to update.
    * - Trims and lowercases the title and genre if provided.
    * 
    * @param id - The ID of the movie to update.
    * @param movie - Partial movie fields to update.
    * @returns A promise that resolves when the movie is updated.
    * @throws BadRequestException if ID is invalid or no fields provided.
    * @throws NotFoundException if the movie with the given ID does not exist.
    */
    async updateMovieInfo(id: number, movie: Partial<Movie>): Promise<void> {
        if (!id || id <= 0) {
            throw new BadRequestException("Invalid movie ID.");
        }

        const movieExists = await this.movieRepository.fetchMovieById(id);
        
        if (!movieExists) {
            throw new NotFoundException(`Movie with ID ${id} not found.`);
        }

        if (Object.keys(movie).length === 0) {
            throw new BadRequestException('No fields provided for update.');
        }

        const updatedMovie : Movie = { ...movieExists, ...movie};

        if (typeof updatedMovie.title === 'string') {
            updatedMovie.title = updatedMovie.title.trim();
            updatedMovie.title = updatedMovie.title.toLowerCase();
          }
        
          if (typeof updatedMovie.genre === 'string') {
            updatedMovie.genre = updatedMovie.genre.trim();
            updatedMovie.genre = updatedMovie.genre.toLowerCase();
          }
        
        return this.movieRepository.updateMovieInfo(id, updatedMovie);

    }

    /**
    * Deletes a movie by its ID.
    * 
    * - Validates that the ID is positive.
    * - Verifies that the movie exists before deleting.
    * 
    * @param id - The ID of the movie to delete.
    * @returns A promise that resolves when the movie is deleted.
    * @throws BadRequestException if the ID is invalid.
    * @throws NotFoundException if the movie with the given ID does not exist.
    */
    async deleteMovie(id: number): Promise<void> {
        if (!id || id <= 0) {
            throw new BadRequestException("Invalid movie ID.");
        }

        const movieExists = await this.movieRepository.fetchMovieById(id);

        if (!movieExists) {
            throw new NotFoundException(`Movie with ID ${id} not found.`);
        }

        return this.movieRepository.deleteMovie(id);
    }

    /**
    * Fetches all movies from the repository.
    * 
    * - Validates that at least one movie exists.
    * 
    * @returns A promise that resolves with an array of movies.
    * @throws BadRequestException if no movies are found.
    */
    async fetchAllMovies(): Promise<Movie[]> {
        const movies = await this.movieRepository.fetchAllMovies();
        
        if (!movies || movies.length === 0 ) {
            throw new BadRequestException("There are no movies.");
        }
        
        return movies;
    }
}