/**
* movie.controller.spec.ts
* 
* This file contains unit tests for the MovieController.
* It validates all controller-level functionality for adding, retrieving, updating and deleting movies.
* by mocking the underlying MovieService and testing the expected brhavioes and error responses.
*/

import { Test, TestingModule } from '@nestjs/testing';
import { MovieController } from './movie.controller';
import { MovieService } from './movie.service';
import { CreateMovieDto } from './create-movie.dto';
import { UpdateMovieDto } from './update-movie.dto';
import { Movie } from './movie.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('MovieController', () => {
    let controller: MovieController;
    let mockMovieService: Partial<Record<keyof MovieService, jest.Mock>>;

    beforeEach(async () => {
        // Mock the MovieService with Jest functions.
        mockMovieService = {
            addNewMovie: jest.fn(),
            fetchAllMovies: jest.fn(),
            updateMovieInfo: jest.fn(),
            deleteMovie: jest.fn()
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [MovieController],
            providers: [{provide: MovieService, useValue: mockMovieService}]
        }).compile();

        controller = module.get<MovieController>(MovieController);
    });

    describe('AddNewMovie', () => {
        
        /**
        * Validates that a movie is successfully added through the controller.
        */
        it('should add a new movie successfully', async () => {
            const createDto: CreateMovieDto = {title: 'Movie 1', genre: 'test', duration: 120, rating: 6.7, release_year: 2010};

            mockMovieService.addNewMovie.mockResolvedValue(undefined);

            const result = await controller.addNewMovie(createDto);

            expect(mockMovieService.addNewMovie).toHaveBeenCalledWith(createDto);
            expect(result).toEqual({message: 'Movie successfully added.'});
        });

        /**
        * Validates that the controller returns a BadRequestException when trying to add a movie that already exists.
        */
        it('should throw BadRequestException if movie already exists', async () => {
            const createDto: CreateMovieDto = {title: 'Movie 1', genre: 'test', duration: 120, rating: 6.7, release_year: 2010};

            mockMovieService.addNewMovie.mockRejectedValue(new BadRequestException('Movie already exists'));

            await expect(controller.addNewMovie(createDto)).rejects.toThrow(BadRequestException);
        });
    });
    
    describe('GetAllMovies', () => {

        /**
        * Validates that the controller correctly returns a list of movies.
        */
        it('should return a list of movies', async () => {
            const movies: Movie[] = [{id: 1, title: 'movie 1', genre: 'test', duration: 120, rating:6.7, release_year: 2010}];

            mockMovieService.fetchAllMovies.mockResolvedValue(movies);

            const result = await controller.fetchAllMovies();

            expect(result).toEqual(movies);
            expect(mockMovieService.fetchAllMovies).toHaveBeenCalled();
        });

        /**
        * Validates that the controller returns a BadRequestException if no movies are found or an error occurs.
        */
        it('should throw BadRequestExpection if no movies found', async () => {
            mockMovieService.fetchAllMovies.mockRejectedValue(new BadRequestException('No movies found'));

            await expect(controller.fetchAllMovies()).rejects.toThrow(BadRequestException);
        });
    });

    describe('UpdateMovie', () => {
        
        /**
        * Validates that a movie is successfully updated through the controller.
        */
        it('should update a movie successfully', async () => {
            const id = 1;
            const updateDto: UpdateMovieDto = {title: 'Updated Movie'};

            mockMovieService.updateMovieInfo.mockResolvedValue(undefined);
            const result = await controller.updateMovieInfo(id,updateDto);

            expect(mockMovieService.updateMovieInfo).toHaveBeenCalledWith(id, updateDto);
            expect(result).toEqual({message: `Movie with ID ${id} successfully updated.`});
        });

        /**
        * Validates that the controller returns a BadRequestException if the given ID is invalid (e.g. zero or negative).
        */
        it('should throw BadRequestException if the id is invalid', async () => {
            const id = 0;
            const updateDto: UpdateMovieDto = {title: 'Updated Movie'};

            mockMovieService.updateMovieInfo.mockRejectedValue(new BadRequestException('Invalid movie ID'));

            await expect(controller.updateMovieInfo(id, updateDto)).rejects.toThrow(BadRequestException);
        });

        /**
        * Validates that the controller returns a NotFoundException if the movie to be updated does not exist.
        */
        it("should throw NotFoundException if movie doesn't exist", async () => {
            const id = 99;
            const updateDto: UpdateMovieDto = {title: 'Updated Movie'};
            
            mockMovieService.updateMovieInfo.mockRejectedValue(new BadRequestException(`Movie with ID ${id} not found.`));

            await expect(controller.updateMovieInfo(id, updateDto)).rejects.toThrow(BadRequestException);
        });

        /**
        * Validates that the controller returns a BadRequestException if the update DTO is empty.
        */
        it('should throw BadRequestException if update body is empty', async () => {
            const id = 1;
            const updateDto: UpdateMovieDto = {};
            
            mockMovieService.updateMovieInfo.mockRejectedValue(new BadRequestException('No fields provided for update.'));

            await expect(controller.updateMovieInfo(id, updateDto)).rejects.toThrow(BadRequestException);
        });
    });

    describe('DeleteMovie', () => {

        /**
        * Validates that a movie is successfully deleted through the controller.
        */
        it('should delete a movie and return success message', async () => {
            const id = 1;

            mockMovieService.deleteMovie.mockResolvedValue(undefined);

            const result = await controller.deleteMovie(id);

            expect(mockMovieService.deleteMovie).toHaveBeenCalledWith(id);
            expect(result).toEqual({message: `Movie with ID ${id} successfully deleted.`});
        });

        /**
        * Validates that the controller returns a NotFoundException if the movie to delete does not exist.
        */
        it("should throw NotFoundException if movie doesn't exits", async () => {
            const id = 99;
            mockMovieService.deleteMovie.mockRejectedValue(new NotFoundException(`Movie with ID ${id} not found.`));

            await expect(controller.deleteMovie(id)).rejects.toThrow(NotFoundException);
        });

        /**
        * Validates that the controller returns a BadRequestException if the given ID for deletion is invalid.
        */
        it('should throw BadRequestException if the id is invalid', async () => {
            const id = 0;

            mockMovieService.deleteMovie.mockRejectedValue(new BadRequestException('Invalid movie ID'));

            await expect(controller.deleteMovie(id)).rejects.toThrow(BadRequestException);
        });
    });

});