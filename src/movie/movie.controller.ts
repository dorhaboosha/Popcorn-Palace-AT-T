/**
* movie.controller.ts
*
* This controller handles incoming HTTP requests related to Movie management.
* It defines endpoints for creating, retrieving, updating, and deleting movies.
* Each endpoint delegates business logic to the MovieService.
*/

import { Body, Controller, Get, Post, Delete, Param } from '@nestjs/common';
import { MovieService } from './movie.service';
import { MovieDto } from './movie.dto';
import { Movie } from './movie.entity';

@Controller('movies')
export class MovieController {
    private readonly movieService: MovieService;

    constructor(movieService: MovieService) {
        this.movieService = movieService;
    }

    /**
    * Handles POST /movies
    * 
    * Adds a new movie to the database.
    * @param movieDto - DTO containing movie details (title, genre, duration, rating, releaseYear).
    * @returns A message indicating successful addition.
    * @throws BadRequestException if the movie already exists or input is invalid.
    */
    @Post()
    async addNewMovie(@Body() movieData: MovieDto): Promise<{ message: string }> {
        await this.movieService.addNewMovie(movieData);
        return { message: 'Movie successfully added.' };
    }

    /**
    * Handles GET /movies/all
    * 
    * Fetches all movies from the database.
    * @returns An array of Movie entities.
    * @throws BadRequestException if no movies are found.
    */
    @Get('all')
    async fetchAllMovies(): Promise<Movie[]> {
        return this.movieService.fetchAllMovies();
    }

    /**
    * Handles POST /movies/update/:title
    * 
    * Updates an existing movie's information based on its current title.
    * @param title - The current title of the movie.
    * @param movieDto - Full movie object to update to.
    * @returns A message confirming the update.
    * @throws BadRequestException if validation fails.
    * @throws NotFoundException if the movie does not exist.
    */
    @Post('update/:title')
    async updateMovieInfo(@Param('title') title: string, @Body() movieData: MovieDto): Promise<{ message: string }> {
        await this.movieService.updateMovieInfo(title, movieData);
        return { message: `Movie titled "${title}" successfully updated.` };
    }

    /**
    * Handles DELETE /movies/:title
    * 
    * Deletes a movie from the database based on its title.
    * @param title - The title of the movie to delete.
    * @returns A message confirming the deletion.
    * @throws NotFoundException if the movie does not exist.
    */
    @Delete(':title')
    async deleteMovie(@Param('title') title: string): Promise<{ message: string }> {
        await this.movieService.deleteMovie(title);
        return { message: `Movie titled "${title}" successfully deleted.` };
    }
}