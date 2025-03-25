/**
* movie.controller.ts
*
* This controller handles incoming HTTP requests related to Movie management.
* It defines endpoints for creating, retrieving, updating, and deleting movies.
* Each endpoint delegates business logic to the MovieService.
*/

import { Body, Controller, Get, Post, Delete, Param, ParseIntPipe, Patch } from '@nestjs/common';
import { MovieService } from './movie.service';
import { CreateMovieDto } from './create-movie.dto';
import { UpdateMovieDto } from './update-movie.dto';
import { Movie } from './movie.entity';

@Controller('movie')
export class MovieController {
    private readonly movieService: MovieService;

    constructor(movieService: MovieService) {
        this.movieService = movieService;
    }

    /**
    * Handles POST /movie/AddNewMovie
    * 
    * Adds a new movie to the database.
    * @param createMovieDto - DTO containing movie details (title, genre, duration, rating, release_year).
    * @returns A message indicating successful addition.
    * @throws BadRequestException if the movie already exists or input is invalid.
    */
    @Post('AddNewMovie')
    async addNewMovie(@Body() createMovieDto: CreateMovieDto): Promise<{ message: string}> {
        await this.movieService.addNewMovie(createMovieDto);
        return { message: 'Movie successfully added.'};
    }

    /**
    * Handles GET /movie/GetAllMovies
    * 
    * Fetches all movies from the database.
    * @returns An array of Movie entities.
    * @throws BadRequestException if no movies are found.
    */
    @Get('GetAllMovies')
    async fetchAllMovies(): Promise<Movie[]> {
        return this.movieService.fetchAllMovies();
    }

    /**
    * Handles PATCH /movie/UpdateMovie/:id
    * 
    * Updates an existing movie's information based on its ID.
    * @param id - The ID of the movie to update (parsed as integer)
    * @param updateMovieDto - DTO with fields to update (can be partial)
    * @returns A message confirming the update.
    * @throws BadRequestException if ID is invalid or update body is empty.
    * @throws NotFoundException if the movie does not exist.
    */
    @Patch('UpdateMovie/:id')
    async updateMovieInfo(@Param('id', ParseIntPipe) id: number, @Body() updateMovieDto: UpdateMovieDto): Promise<{ message: string }> {
        await this.movieService.updateMovieInfo(id, updateMovieDto);
        return { message: `Movie with ID ${id} successfully updated.`};
    }

    /**
    * Handles DELETE /movie/DeleteMovie/:id
    * 
    * Deletes a movie from the database based on its ID.
    * @param id - The ID of the movie to delete (parsed as integer)
    * @returns A message confirming the deletion.
    * @throws BadRequestException if the ID is invalid.
    * @throws NotFoundException if the movie does not exist.
    */
    @Delete('DeleteMovie/:id')
    async deleteMovie(@Param('id', ParseIntPipe) id: number): Promise<{ message: string }> {
        await this.movieService.deleteMovie(id);
        return { message: `Movie with ID ${id} successfully deleted.`};
    }

}