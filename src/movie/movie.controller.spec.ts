/**
* movie.controller.spec.ts
* 
* This file contains unit tests for the MovieController.
* It validates all controller-level functionality for adding, retrieving, updating, and deleting movies
* by mocking the underlying MovieService and testing expected behaviors and error responses.
*/

import { Test, TestingModule } from '@nestjs/testing';
import { MovieController } from './movie.controller';
import { MovieService } from './movie.service';
import { MovieDto } from './movie.dto';
import { Movie } from './movie.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('MovieController', () => {
    let controller: MovieController;
    let mockMovieService: Partial<Record<keyof MovieService, jest.Mock>>;

    beforeEach(async () => {
        mockMovieService = {
            addNewMovie: jest.fn(),
            fetchAllMovies: jest.fn(),
            updateMovieInfo: jest.fn(),
            deleteMovie: jest.fn()
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [MovieController],
            providers: [
                { provide: MovieService, useValue: mockMovieService }
            ]
        }).compile();

        controller = module.get<MovieController>(MovieController);
    });

    describe('addNewMovie', () => {

        /**
        * Validates that a movie is successfully added through the controller.
        */
        it('should add a new movie successfully', async () => {
            const data: MovieDto = { title: 'Inception', genre: 'Sci-Fi', duration: 148, rating: 8.8, releaseYear: 2010};

            mockMovieService.addNewMovie.mockResolvedValue(undefined);

            const result = await controller.addNewMovie(data);

            expect(mockMovieService.addNewMovie).toHaveBeenCalledWith(data);
            expect(result).toEqual({ message: 'Movie successfully added.' });
        });

        /**
        * Validates that the controller throws a BadRequestException when trying to add a duplicate movie.
        */
        it('should throw BadRequestException if movie already exists', async () => {
            const data: MovieDto = {title: 'Inception', genre: 'Sci-Fi', duration: 148, rating: 8.8, releaseYear: 2010};

            mockMovieService.addNewMovie.mockRejectedValue(new BadRequestException('Movie already exists'));

            await expect(controller.addNewMovie(data)).rejects.toThrow(BadRequestException);
        });
    });

    describe('fetchAllMovies', () => {

        /**
        * Validates that all movies are returned through the controller.
        */
        it('should return a list of movies', async () => {
            const movies: Movie[] = [{id: 1, title: 'inception', genre: 'sci-fi', duration: 148, rating: 8.8, releaseYear: 2010}];

            mockMovieService.fetchAllMovies.mockResolvedValue(movies);

            const result = await controller.fetchAllMovies();

            expect(result).toEqual(movies);
            expect(mockMovieService.fetchAllMovies).toHaveBeenCalled();
        });

        /**
        * Validates that the controller throws BadRequestException when no movies are found.
        */
        it('should throw BadRequestException if no movies found', async () => {
            mockMovieService.fetchAllMovies.mockRejectedValue(new BadRequestException('No movies found'));

            await expect(controller.fetchAllMovies()).rejects.toThrow(BadRequestException);
        });
    });

    describe('updateMovieInfo', () => {

        /**
        * Validates that a movie is successfully updated through the controller.
        */
        it('should update a movie successfully', async () => {
            const title = 'inception';
            const updatedData: MovieDto = {title: 'Inception', genre: 'Sci-Fi', duration: 150, rating: 9, releaseYear: 2012};

            mockMovieService.updateMovieInfo.mockResolvedValue(undefined);

            const result = await controller.updateMovieInfo(title, updatedData);

            expect(mockMovieService.updateMovieInfo).toHaveBeenCalledWith(title, updatedData);
            expect(result).toEqual({ message: `Movie titled "${title}" successfully updated.` });
        });

        /**
        * Validates that BadRequestException is thrown when update fails due to invalid title.
        */
        it('should throw BadRequestException if title param is invalid', async () => {
            const title = '';
            const dto: MovieDto = {title: 'Inception', genre: 'Sci-Fi', duration: 150, rating: 9, releaseYear: 2012};

            mockMovieService.updateMovieInfo.mockRejectedValue(new BadRequestException('Movie title must be provided.'));

            await expect(controller.updateMovieInfo(title, dto)).rejects.toThrow(BadRequestException);
        });

        /**
        * Validates that NotFoundException is thrown if movie does not exist.
        */
        it('should throw NotFoundException if movie is not found', async () => {
            const title = 'notfound';
            const updatedData: MovieDto = {title: 'Inception', genre: 'Sci-Fi', duration: 150, rating: 9, releaseYear: 2012 };

            mockMovieService.updateMovieInfo.mockRejectedValue(new NotFoundException('Movie not found'));

            await expect(controller.updateMovieInfo(title, updatedData)).rejects.toThrow(NotFoundException);
        });

        /**
        * Validates that BadRequestException is thrown if duplicate movie title is being used in update.
        */
        it('should throw BadRequestException for duplicate title update', async () => {
            const title = 'oldtitle';
            const dto: MovieDto = {title: 'existingTitle', genre: 'Action', duration: 100, rating: 8, releaseYear: 2020 };

            mockMovieService.updateMovieInfo.mockRejectedValue(new BadRequestException('A movie with that title already exists.'));

            await expect(controller.updateMovieInfo(title, dto)).rejects.toThrow(BadRequestException);
        });
    });

    describe('deleteMovie', () => {

        /**
        * Validates that a movie is deleted successfully through the controller.
        */
        it('should delete a movie successfully', async () => {
            const title = 'inception';

            mockMovieService.deleteMovie.mockResolvedValue(undefined);

            const result = await controller.deleteMovie(title);

            expect(mockMovieService.deleteMovie).toHaveBeenCalledWith(title);
            expect(result).toEqual({ message: `Movie titled "${title}" successfully deleted.` });
        });

        /**
        * Validates that NotFoundException is thrown if movie does not exist.
        */
        it('should throw NotFoundException if movie is not found', async () => {
            const title = 'notfound';

            mockMovieService.deleteMovie.mockRejectedValue(
                new NotFoundException('Movie not found')
            );

            await expect(controller.deleteMovie(title)).rejects.toThrow(NotFoundException);
        });

        /**
        * Validates that BadRequestException is thrown if title is empty or invalid.
        */
        it('should throw BadRequestException if title is invalid', async () => {
            const title = '';

            mockMovieService.deleteMovie.mockRejectedValue(
                new BadRequestException('Movie title must be provided')
            );

            await expect(controller.deleteMovie(title)).rejects.toThrow(BadRequestException);
        });
    });
});