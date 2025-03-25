/**
* movie.service.spec.ts
* 
* This file contains unit tests for the MovieService class using Jest and the NestJS testing framework.
* The tests mock the MovieRepository to verify service-level logic including:
*  - Fetching movies
*  - Adding new movies
*  - Updating existing movies
*  - Deleting movies
* 
* The tests ensure that data normalization (trimming and lowercasing) is applied,
* duplicates are detected, and all relevant error cases (BadRequest, NotFound, etc.) are properly handled.
*/
import { Test, TestingModule } from '@nestjs/testing';
import { MovieService } from './movie.service';
import { MovieRepository } from '../movie/movie.repository';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Movie } from './movie.entity';

describe('MovieService', () => {
    let service: MovieService;
    let mockMovieRepository: Partial<Record<keyof MovieRepository, jest.Mock>>;

    beforeEach(async () => {
        mockMovieRepository = {
            fetchAllMovies: jest.fn(),
            fetchMovieById: jest.fn(),
            fetchMovieByTitleAndReleaseYear: jest.fn(),
            addNewMovie: jest.fn(),
            updateMovieInfo: jest.fn(),
            deleteMovie: jest.fn()
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [MovieService, {provide: 'MovieRepository', useValue: mockMovieRepository}]}).compile();
        
        service = module.get<MovieService>(MovieService);
    });

    describe('fetchAllMovies', () => {
        /**
        * Tests that all movies are returned when they exist in the repository.
        */
        it('should return all movies when they exist', async () => {
            const mockMovies: Movie[] = [
                {id: 1, title: 'movie 1', genre: 'test', duration: 120, rating: 8.5, release_year: 2020}];
            
            mockMovieRepository.fetchAllMovies.mockResolvedValue(mockMovies);
            const result = await service.fetchAllMovies();
            expect(result).toEqual(mockMovies);
        });

        /**
        * Tests that BadRequestException is thrown when no movies are found.
        */
        it('should throw BadRequestException when no movies are found', async () => {
            mockMovieRepository.fetchAllMovies.mockResolvedValue([]);

            await expect(service.fetchAllMovies()).rejects.toThrow(BadRequestException);
        });

        /**
        * Tests that an unexpected repository failure throws a generic error.
        */
        it('should thorw if repository.fetchAllMovies fails unexpectedly', async () => {
            mockMovieRepository.fetchAllMovies.mockRejectedValue(new Error('Simulated DB failure'));

            await expect(service.fetchAllMovies()).rejects.toThrow('Simulated DB failure');
        });
    });

    describe('addNewMovie', () => {
        /**
        * Tests that a new movie is added if it does not already exist.
        */
        it("should add a new movie if it doesn't exist", async () => {
            const newMovie = {title: 'Movie 1', genre: 'test', duration: 120, rating: 8.5, release_year: 2010};

            mockMovieRepository.fetchMovieByTitleAndReleaseYear.mockResolvedValue(null);
            mockMovieRepository.addNewMovie.mockResolvedValue(undefined);

            await service.addNewMovie(newMovie);
            expect(mockMovieRepository.addNewMovie).toHaveBeenCalledWith(newMovie);
        });

        /**
        * Ensures that title and genre are trimmed before insertion.
        */
        it('should trim title and genre before adding movie', async () => {
            const untrimmedMovie = {title: '  Movie 1  ', genre: '   test 1   ', duration: 124, rating: 6.7, release_year: 2010};

            mockMovieRepository.fetchMovieByTitleAndReleaseYear.mockResolvedValue(null);
            mockMovieRepository.addNewMovie.mockResolvedValue(undefined);

            await service.addNewMovie({...untrimmedMovie });

            expect(mockMovieRepository.addNewMovie).toHaveBeenCalledWith({...untrimmedMovie, title: 'movie 1', genre: 'test 1'});
        });

        /**
        * Ensures that title and genre are lowercased before insertion.
        */
        it('should lowercase title and genre before adding movie', async () => {
            const unlowercaseMovie = { title: 'MoViE 1',genre: 'TeSt', duration: 120, rating: 6.7, release_year: 2010};
          
            mockMovieRepository.fetchMovieByTitleAndReleaseYear.mockResolvedValue(null);
            mockMovieRepository.addNewMovie.mockResolvedValue(undefined);
          
            await service.addNewMovie(unlowercaseMovie);
          
            expect(mockMovieRepository.addNewMovie).toHaveBeenCalledWith({...unlowercaseMovie, title: 'movie 1', genre: 'test'});
        });

        /**
        * Validates duplicate detection regardless of casing and spacing.
        * Throws BadRequestException.
        */
        it('should detect duplicate movie even with title case or spaces', async () => {
            const existingMovie = {id: 1, title: 'movie 1', genre: 'test', duration: 120, rating: 6.7, release_year: 2010};

            mockMovieRepository.fetchMovieByTitleAndReleaseYear.mockResolvedValue(existingMovie);

            const newMovie = {title: '  moviE 1   ', genre: 'test', duration: 124, rating: 6.7, release_year: 2010};

            await expect(service.addNewMovie(newMovie)).rejects.toThrow(BadRequestException);
        });

        /**
        * Throws BadRequestException if the movie already exists.
        */
        it("should throw BadRequestException if the movie alrady exists", async () => {
            const newMovie = {title: 'Movie 1', genre: 'test', duration: 120, rating: 8.5, release_year: 2010};

            mockMovieRepository.fetchMovieByTitleAndReleaseYear.mockResolvedValue(newMovie);

            await expect(service.addNewMovie(newMovie)).rejects.toThrow(BadRequestException);
        });

        /**
        * Throws an error if repository.addNewMovie fails unexpectedly.
        */
        it('should throw if repository.addNewMovie fails', async () => {
            const newMovie = {title: 'Movie 1', genre: 'test', duration: 120, rating: 6.7, release_year: 2010};

            mockMovieRepository.fetchMovieByTitleAndReleaseYear.mockResolvedValue(null);
            mockMovieRepository.addNewMovie.mockRejectedValue(new Error('Simulated DB failure'));

            await expect(service.addNewMovie(newMovie)).rejects.toThrow('Simulated DB failure');
        });
    });

    describe('updateMovieInfo', () => {
        const existingMovie = {id: 1, title: 'movie 1', genre: 'test', duration: 120, rating: 8.5, release_year: 2010};

        /**
        * Updates a movie if it exists in the repository.
        */
        it('should update a movie if it exists', async () => {
            const updates = {title: 'Updated Movie 1'};

            mockMovieRepository.fetchMovieById.mockResolvedValue(existingMovie);
            mockMovieRepository.updateMovieInfo.mockResolvedValue(undefined);

            await service.updateMovieInfo(1, updates);

            expect(mockMovieRepository.updateMovieInfo).toHaveBeenCalledWith(1, {...existingMovie, ...updates, title: 'updated movie 1' });
        });

        /**
        * Ensures trimming of title and genre during update.
        */
        it('should trim title and genre when updating a movie', async () => {
            const existingMovie = {id: 1, title: 'movie 1', genre: 'test', duration: 120, rating: 6.7, release_year: 2010};
            const updates = {title: '  Updated Movie 1  ', genre: '    test   '};

            mockMovieRepository.fetchMovieById.mockResolvedValue(existingMovie);
            mockMovieRepository.updateMovieInfo.mockResolvedValue(undefined);

            await service.updateMovieInfo(1,updates);

            expect(mockMovieRepository.updateMovieInfo).toHaveBeenCalledWith(1, {...existingMovie, ...updates, title: 'updated movie 1', genre: 'test'});
        });

        /**
        * Ensures lowercasing of title and genre during update.
        */
        it('should lowercase title and genre when updating a movie', async () => {
            const existingMovie = { id: 1, title: 'movie 1', genre: 'test', duration: 120, rating: 6.7, release_year: 2010};
          
            const updates = { title: 'UpdAtEd TITLE',genre: 'NeW TeSt'};
          
            mockMovieRepository.fetchMovieById.mockResolvedValue(existingMovie);
            mockMovieRepository.updateMovieInfo.mockResolvedValue(undefined);
          
            await service.updateMovieInfo(1, updates);
          
            expect(mockMovieRepository.updateMovieInfo).toHaveBeenCalledWith(1, {...existingMovie, ...updates, title: 'updated title', genre: 'new test'});
        });

        /**
        * Allows updating only numeric fields like rating or duration.
        */
        it('should update numeric fields without issues when title and genre are not provided', async() => {
            const existingMovie = {id: 1, title: 'movie 1', genre: 'test', duration: 120, rating: 6.7, release_year: 2010};
            const updates = {duration: 150, rating: 9.0};

            mockMovieRepository.fetchMovieById.mockResolvedValue(existingMovie);
            mockMovieRepository.updateMovieInfo.mockResolvedValue(undefined);

            await service.updateMovieInfo(1,updates);

            expect(mockMovieRepository.updateMovieInfo).toHaveBeenCalledWith(1, { ...existingMovie, ...updates});
        });

        /**
        * Throws BadRequestException if ID is invalid.
        */
        it('should throw BadRequestException if ID is invalid', async () => {
            await expect(service.updateMovieInfo(0,{})).rejects.toThrow(BadRequestException);
        });

        /**
        * Throws NotFoundException if the movie with given ID is not found.
        */
        it('should throw NotFoundException if movie not found', async () => {
            mockMovieRepository.fetchMovieById.mockResolvedValue(null);

            await expect(service.updateMovieInfo(1, {title: 'Updated Movie 1'})).rejects.toThrow(NotFoundException);
        });

        /**
        * Throws BadRequestException if no updates are provided.
        */
        it('should throw BadRequestException if update body is empty', async () => {
            mockMovieRepository.fetchMovieById.mockResolvedValue(existingMovie);

            await expect(service.updateMovieInfo(1,{})).rejects.toThrow(BadRequestException);
        });

        /**
        * Throws a generic error if the repository call fails unexpectedly.
        */
        it('should throw if repository.updateMovieInfo fails', async () => {
            const existingMovie = {id: 1, title: 'movie 1', genre: 'test', duration: 120, rating: 6.7, release_year: 2010};
            const updates = {title: 'Updated Movie 1'};

            mockMovieRepository.fetchMovieById.mockResolvedValue(existingMovie);
            mockMovieRepository.updateMovieInfo.mockRejectedValue(new Error('Simulated DB failure'));

            await expect(service.updateMovieInfo(1, updates)).rejects.toThrow('Simulated DB failure');
        });
    });

    describe('deleteMovie', () => {
        /**
        * Successfully deletes a movie if it exists.
        */
        it('should delete a movie if it exists', async () => {
            mockMovieRepository.fetchMovieById.mockResolvedValue({id: 1});
            mockMovieRepository.deleteMovie.mockResolvedValue(undefined);

            await service.deleteMovie(1);

            expect(mockMovieRepository.deleteMovie).toHaveBeenCalledWith(1);
        });

        /**
        * Throws BadRequestException if the ID is invalid (e.g., zero or negative).
        */
        it('should throw BadRequestException if ID is invalid', async () => {
            await expect(service.deleteMovie(0)).rejects.toThrow(BadRequestException);
        })

        /**
        * Throws NotFoundException if the movie to delete does not exist.
        */
        it("should throw NotFoundException if movie doesn't exist", async () => {
            mockMovieRepository.fetchMovieById.mockResolvedValue(null);

            await expect(service.deleteMovie(1)).rejects.toThrow(NotFoundException);
        });

        /**
        * Throws an error if the repository fails during delete.
        */
        it('should throw if repository.deleteMovie fails', async () => {
            mockMovieRepository.fetchMovieById.mockResolvedValue({id: 1});
            mockMovieRepository.deleteMovie.mockRejectedValue(new Error('Simulated DB failure'));

            await expect(service.deleteMovie(1)).rejects.toThrow('Simulated DB failure');
        });
    });
});