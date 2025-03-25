/**
* showTime.service.spec.ts
* 
* This file contains unit tests for the `ShowTimeService` in a NestJS application.
* 
* The tests use Jest to mock dependencies (`ShowTimeRepository` and `MovieRepository`) and
* validate that the service behaves correctly in various scenarios, including:
* - Adding a showtime
* - Updating a showtime
* - Deleting a showtime
* - Fetching a showtime by ID
* 
* Each test verifies correct logic, error handling, trimming/lowercasing behaviors,
* and repository interactions.
*/

import { Test, TestingModule } from "@nestjs/testing";
import { ShowTimeService } from "./showTime.service";
import { ShowTimeRepository } from "./showTime.repository";
import { MovieRepository } from "../movie/movie.repository";
import { BadRequestException, NotFoundException } from "@nestjs/common";

describe("ShowTimeService", () => {
    let service: ShowTimeService;
    let mockShowTimeRepository: Partial<Record<keyof ShowTimeRepository, jest.Mock>>;
    let mockMovieRepository: Partial<Record<keyof MovieRepository, jest.Mock>>;

    beforeEach(async () => {
        mockShowTimeRepository = {
            addNewShowTime: jest.fn(),
            hasOverLappingShowTime: jest.fn(),
            fetchShowTimeById: jest.fn(),
            updateShowTimeInfo: jest.fn(),
            deleteShowTime: jest.fn(),
            findExactShowTime: jest.fn()
        };

        mockMovieRepository = {
            fetchMovieByTitleAndReleaseYear: jest.fn(),
            fetchMovieById: jest.fn()
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [ShowTimeService, {provide: 'ShowTimeRepository', useValue: mockShowTimeRepository}, 
                        {provide: 'MovieRepository', useValue: mockMovieRepository}]}).compile();

        service = module.get<ShowTimeService>(ShowTimeService);                
    });

    describe('addNewShowTime', () => {
        
        /**
        * Should add a new showtime if all validations pass.
        */
        it('should successfully add a new showtime', async () => {
            const showtime = {
                movie_title: "movie title", movie_release_year: 2010,
                theater: 'theater name', start_time: '14:00', end_time: '16:00', price: 25.5};
            
            const movie = {id: 1, title: 'movie title', genre: 'test', duration: 120, rating: 8.5, release_year: 2010};

            mockMovieRepository.fetchMovieByTitleAndReleaseYear.mockResolvedValue(movie);
            mockShowTimeRepository.hasOverLappingShowTime.mockResolvedValue(false);
            mockShowTimeRepository.findExactShowTime.mockResolvedValue(null);
            mockShowTimeRepository.addNewShowTime.mockResolvedValue(undefined);

            await service.addNewShowTime(showtime);
            expect(mockShowTimeRepository.addNewShowTime).toHaveBeenCalled();
        });

        /**
        * Should throw if the movie is not found.
        */
        it("should throw NotFoundException if movie doesn't exist", async () => {
            const showtime = {movie_title: "movie title", movie_release_year: 2010, theater: "theater name",
                    start_time: "14:00", end_time: "16:00", price: 25.5};
            
            mockMovieRepository.fetchMovieByTitleAndReleaseYear.mockResolvedValue(null);
            await expect(service.addNewShowTime(showtime)).rejects.toThrow(NotFoundException);
        });

        /**
        * Should throw if start time and end time are equal.
        */
        it('should throw BadRequestException if start_time equals end_time', async () => {
            const showtime = {movie_title: "movie title", movie_release_year: 2010, theater: "theater name:",
                        start_time: "14:00", end_time: "14:00", price: 25.5};
            
            const movie = {id: 1, title: 'movie title', genre: 'test', duration: 120, rating: 8.5, release_year: 2010};

            mockMovieRepository.fetchMovieByTitleAndReleaseYear.mockResolvedValue(movie);

            await expect(service.addNewShowTime(showtime)).rejects.toThrow(BadRequestException);
        });

        /**
        * Should throw if start time is after end time.
        */
        it('should throw BadRequestException if start_time is after end_time', async () => {
            const showtime = {movie_title: "movie title", movie_release_year: 2010, theater: "theater name",
                    start_time: "16:00", end_time: "14:00", price: 25.5};
            
            const movie = {id: 1, title: 'movie title', genre: 'test', duration: 120, rating: 8.5, release_year: 2010};
            mockMovieRepository.fetchMovieByTitleAndReleaseYear.mockResolvedValue(movie);

            await expect(service.addNewShowTime(showtime)).rejects.toThrow(BadRequestException);
        });

        /**
        * Should throw if the duration doesn't match the movie's duration.
        */
        it('should throw BadRequestException if showtime duration mismatches movie duration', async () => {
            const showtime = {movie_title: "movie title", movie_release_year: 2010, theater: "theater name",
                    start_time: "14:00", end_time: "16:00", price: 25.5};
            
            const movie = {id: 1, title: 'movie title', genre: 'test', duration: 90, rating: 8.5, release_year: 2010};
            mockMovieRepository.fetchMovieByTitleAndReleaseYear.mockResolvedValue(movie);

            await expect(service.addNewShowTime(showtime)).rejects.toThrow(BadRequestException);
        });

        /**
        * Should throw if an overlapping showtime exists in the same theater.
        */
        it('should throw BadRequestException if overlapping showtime exists',  async () => {
            const showtime = {movie_title: "movie title", movie_release_year: 2010, theater: "theater name",
                    start_time: "14:00", end_time: "16:00", price: 25.5};
            
            const movie = {id: 1, title: 'movie title', genre: 'test', duration: 120, rating: 8.5, release_year: 2010};
            mockMovieRepository.fetchMovieByTitleAndReleaseYear.mockResolvedValue(movie);
            mockShowTimeRepository.hasOverLappingShowTime.mockResolvedValue(true);

            await expect(service.addNewShowTime(showtime)).rejects.toThrow(BadRequestException);
        });

        /**
        * Should throw if the exact same showtime already exists.
        */
        it('should throw BadRequestException if showtime already exists', async () => {
            const showtime = {movie_title: "movie title", movie_release_year: 2010, theater: "theater name",
                    start_time: "14:00", end_time: "16:00", price: 25.5};
            
            const movie = {id: 1, title: 'movie title', genre: 'test', duration: 120, rating: 8.5, release_year: 2010};
            mockMovieRepository.fetchMovieByTitleAndReleaseYear.mockResolvedValue(movie);
            mockShowTimeRepository.hasOverLappingShowTime.mockResolvedValue(false);
            mockShowTimeRepository.findExactShowTime.mockResolvedValue({id: 1, ...showtime});

            await expect(service.addNewShowTime(showtime)).rejects.toThrow(BadRequestException);
        });

        /**
        * Should rethrow unexpected errors from addNewShowTime().
        */
        it('should thorw if repositort.addNewShowTime throw error unexpectedly', async () => {
            const showtime = {movie_title: 'movie title', movie_release_year: 2010, theater: 'thearter name',
                                start_time: '14:00', end_time: '16:00', price: 25.5};
            
            const movie = {id: 1, title: 'movie title', genre: 'test', duration: 120, rating: 8.5, release_year: 2010};
            mockMovieRepository.fetchMovieByTitleAndReleaseYear.mockResolvedValue(movie);
            mockShowTimeRepository.hasOverLappingShowTime.mockResolvedValue(false);
            mockShowTimeRepository.findExactShowTime.mockResolvedValue(null);
            mockShowTimeRepository.addNewShowTime.mockRejectedValue(new Error('DB insert error'));

            await expect(service.addNewShowTime(showtime)).rejects.toThrow('DB insert error');
        });

        /**
        * Should trim and lowercase title and theater before querying movie/showtime.
        */
        it('should handle trimming and lowercasing of movie_title and theater', async () => {
            const showtime = {movie_title: "  MOVIE TitLE  ", movie_release_year: 2010, theater: "  THEaTeR NAME  ",
                    start_time: "14:00", end_time: "16:00", price: 25.5};
            
            const movie = {id: 1, title: 'movie title', genre: 'test', duration: 120, rating: 8.5, release_year: 2010};
            mockMovieRepository.fetchMovieByTitleAndReleaseYear.mockResolvedValue(movie);
            mockShowTimeRepository.hasOverLappingShowTime.mockResolvedValue(false);
            mockShowTimeRepository.findExactShowTime.mockResolvedValue(null);
            mockShowTimeRepository.addNewShowTime.mockResolvedValue(undefined);

            await service.addNewShowTime(showtime);
            expect(mockMovieRepository.fetchMovieByTitleAndReleaseYear).toHaveBeenCalledWith('movie title', 2010);
        });

        /**
        * Should throw if the showtime price is 0 or negative.
        */
        it('should throw BadRequestException if price is zero or negative', async () => {
            const showTime = {movie_title: "movie title", movie_release_year: 2010, theater: "theater name",
                                start_time: "14:00", end_time: "16:00", price: 0};
                            
            const movie = {id: 1, title: 'movie title', genre: 'test', duration: 120, rating: 8.5, release_year: 2010};

            mockMovieRepository.fetchMovieByTitleAndReleaseYear.mockResolvedValue(movie);

            await expect(service.addNewShowTime(showTime)).rejects.toThrow(BadRequestException);
        });
    });
    describe('updateShowTime', () => {

        /**
        * Should update showtime successfully if valid.
        */
        it('should successfully update a showtime', async () => {
            const id = 1;
            const existingShowTime = {id, movie_id: 1, theater: 'theater name', start_time: '14:00', end_time: '16:00', price: 20};
            const movie = {id: 1, title: 'movie title', genre: 'test', duration: 120, rating: 8.5, release_year: 2010};
            const updates = {price: 25};

            mockShowTimeRepository.fetchShowTimeById.mockResolvedValue(existingShowTime);
            mockMovieRepository.fetchMovieById.mockResolvedValue(movie);
            mockShowTimeRepository.updateShowTimeInfo.mockResolvedValue(undefined);

            await service.updateShowTimeInfo(id, updates);

            expect(mockShowTimeRepository.updateShowTimeInfo).toHaveBeenCalledWith(id, expect.objectContaining({ price: 25 }));
        });

        /**
        * Should throw if update object is empty.
        */
        it('should throw NotFoundException if all update fields are empty', async () => {
            const id = 1;
            const existingShowTime= {id, movie_id: 1, theater: 'theater name', start_time: '14:00', end_time: '16:00', price: 20};
            const updates = {};

            mockShowTimeRepository.fetchShowTimeById.mockResolvedValue(existingShowTime);
            mockShowTimeRepository.updateShowTimeInfo.mockResolvedValue(null);

            await expect(service.updateShowTimeInfo(id, updates)).rejects.toThrow(NotFoundException);
        });

        /**
        * Should throw if only movie title or release year is provided, not both.
        */
        it('should throw BadRequestException if only movie title or release year is provided', async () => {
            const id = 1;
            const existingShowTime = {id, movie_id: 1, theater: 'theater name', start_time: '14:00', end_time: '16:00', price: 20};

            mockShowTimeRepository.fetchShowTimeById.mockResolvedValue(existingShowTime);

            await expect(service.updateShowTimeInfo(id, {movie_title: 'Test Movie'})).rejects.toThrow(BadRequestException);
            await expect(service.updateShowTimeInfo(id, {movie_release_year: 2010})).rejects.toThrow(BadRequestException);
        });

        /**
        * Should update movie if changed and revalidate duration.
        */
        it('should update movie and revalidate showtime duration', async () => {
            const id = 1;
            const updates = { movie_title: 'Updated Movie', movie_release_year: 2020};
            const existingShowTime = {id, movie_id: 1, theater: 'theater name', start_time: '14:00', end_time: '16:00', price: 20};
            const movie = {id: 2, duration: 120};

            mockShowTimeRepository.fetchShowTimeById.mockResolvedValue(existingShowTime);
            mockMovieRepository.fetchMovieByTitleAndReleaseYear.mockResolvedValue(movie);
            mockShowTimeRepository.updateShowTimeInfo.mockResolvedValue(undefined);

            await service.updateShowTimeInfo(id, updates);

            expect(mockShowTimeRepository.updateShowTimeInfo).toHaveBeenCalled();
        });

        /**
        * Should throw if new movie is not found.
        */
        it("should throw NotFoundException if movie isn't found during update", async () => {
            const id = 1;
            const updates = { movie_title: 'Updated Movie', movie_release_year: 2020};
            const existingShowTime = {id, movie_id: 1, theater: 'theater name', start_time: '14:00', end_time: '16:00', price: 20};

            mockShowTimeRepository.fetchShowTimeById.mockResolvedValue(existingShowTime);
            mockMovieRepository.fetchMovieByTitleAndReleaseYear.mockResolvedValue(null);

            await expect(service.updateShowTimeInfo(id, updates)).rejects.toThrow(NotFoundException);
        });

        /**
        * Should throw if showtime to update does not exist.
        */
        it("should throw NotFoundException if showtime isn't found", async () => {
            mockShowTimeRepository.fetchShowTimeById.mockResolvedValue(null);

            await expect(service.updateShowTimeInfo(99, { price: 20 })).rejects.toThrow(NotFoundException);
        });

        /**
        * Should throw if updated start and end times are equal.
        */
        it('should throw BadRequestException if start_time equals end_time' ,  async () => {
            const id = 1;
            const existingShowTime = { id, movie_id: 1, theater: 'theater name', start_time: '14:00', end_time: '16:00', price: 20};
            const updates = { start_time: '14:00', end_time: '14:00'};

            mockShowTimeRepository.fetchShowTimeById.mockResolvedValue(existingShowTime);
            mockMovieRepository.fetchMovieById.mockResolvedValue({ id: 1, duration: 120});

            await expect(service.updateShowTimeInfo(id, updates)).rejects.toThrow(BadRequestException);
        });

        /**
        * Should throw if updated start time is after end time.
        */
        it('should throw BadRequestException if start_time is after end_time', async () => {
            const id = 1;
            const existingShowTime = {id, movie_id: 1, theater: 'theater name', start_time: '14:00', end_time: '16:00', price: 20};
            const updates = {start_time: '16:00', end_time: '14:00'};

            mockShowTimeRepository.fetchShowTimeById.mockResolvedValue(existingShowTime);
            mockMovieRepository.fetchMovieById.mockResolvedValue({ id: 1, duration: 120 });

            await expect(service.updateShowTimeInfo(id, updates)).rejects.toThrow(BadRequestException);
        });

        /**
        * Should throw if updated duration doesn't match movie duration.
        */
        it('should throw BadRequestException if updated showtime duration mismatches movie duration', async () => {
            const id = 1;
            const existingShowTime = {id, movie_id: 1, theater: 'theater name', start_time: '14:00', end_time: '16:00', price: 20};
            const updates = {start_time: '14:00', end_time: '15:00'};

            mockShowTimeRepository.fetchShowTimeById.mockResolvedValue(existingShowTime);
            mockMovieRepository.fetchMovieById.mockResolvedValue({ id: 1, duration: 120 });

            await expect(service.updateShowTimeInfo(id, updates)).rejects.toThrow(BadRequestException);
        });

        /**
        * Should throw if updated time causes overlap.
        */
        it('should throw BadRequestException if updates showtime overlaps', async () => {
            const id = 1;
            const existingShowTime = {id, movie_id: 1, theater: 'theater name', start_time: '14:00', end_time: '16:00', price: 20};
            const updates = {start_time: '15:00', end_time: '17:00'};

            mockShowTimeRepository.fetchShowTimeById.mockResolvedValue(existingShowTime);
            mockMovieRepository.fetchMovieById.mockResolvedValue({ id: 1, duration: 120 });
            mockShowTimeRepository.hasOverLappingShowTime.mockResolvedValue(true);

            await expect(service.updateShowTimeInfo(id, updates)).rejects.toThrow(BadRequestException);
        });

        /**
        * Should rethrow unexpected errors from updateShowTimeInfo().
        */
        it('should throw if repository.updateShowTimeInfo fails unexpectedly', async () => {
            const id = 1;
            const updates = { price: 22 };
            const existingShowTime = {
                id, movie_id: 1, theater: 'room 1', start_time: '14:00', end_time: '16:00', price: 20
            };
        
            mockShowTimeRepository.fetchShowTimeById.mockResolvedValue(existingShowTime);
            mockMovieRepository.fetchMovieById.mockResolvedValue({ id: 1, duration: 120 });
            mockShowTimeRepository.updateShowTimeInfo.mockRejectedValue(new Error('DB update failed'));
        
            await expect(service.updateShowTimeInfo(id, updates)).rejects.toThrow('DB update failed');
        });

        /**
        * Should throw if updated price is zero or less.
        */
        it('should throw BadRequestException if updated price is zero or negative', async () => {
            const id = 1;
            const updates = { price: 0 };
            const existingShowTime = {id, movie_id: 1, theater: 'theater name', start_time: '14:00', end_time: '16:00', price: 20 };
        
            mockShowTimeRepository.fetchShowTimeById.mockResolvedValue(existingShowTime);
            mockMovieRepository.fetchMovieById.mockResolvedValue({ id: 1, duration: 120 });
        
            await expect(service.updateShowTimeInfo(id, updates)).rejects.toThrow(BadRequestException);
        });

        /**
        * Should trim and lowercase theater name on update.
        */
        it('should trim and lowercase the updated theater name', async () => {
            const id = 1;
            const updates = { theater: '  NeW TheaTER  ' };
            const existingShowTime = { id, movie_id: 1, theater: 'old theater', start_time: '14:00', end_time: '16:00', price: 20 };
        
            const movie = { id: 1, duration: 120 };
        
            mockShowTimeRepository.fetchShowTimeById.mockResolvedValue(existingShowTime);
            mockMovieRepository.fetchMovieById.mockResolvedValue(movie);
            mockShowTimeRepository.hasOverLappingShowTime.mockResolvedValue(false);
            mockShowTimeRepository.updateShowTimeInfo.mockResolvedValue(undefined);
        
            await service.updateShowTimeInfo(id, updates);
        
            expect(mockShowTimeRepository.updateShowTimeInfo).toHaveBeenCalledWith(id, 
                    expect.objectContaining({ theater: 'new theater' }));
        });
    });

    describe('deleteShowTime', () => {

        /**
        * Should delete showtime if it exists.
        */
        it('should delete a showtime successfully', async () => {
            const id = 1;
            const existingShowTime = {id, movie_id: 1, theater: 'theater name', start_time: '14:00', end_time: '16:00', price: 20};

            mockShowTimeRepository.fetchShowTimeById.mockResolvedValue(existingShowTime);
            mockShowTimeRepository.deleteShowTime.mockResolvedValue(undefined);

            await expect(service.deleteShowTime(id)).resolves.toBeUndefined();
            expect(mockShowTimeRepository.deleteShowTime).toHaveBeenCalledWith(id);
        });

        /**
        * Should throw if ID is invalid.
        */
        it('should throw BadRequestException if id is zero', async () => {
            await expect(service.deleteShowTime(0)).rejects.toThrow(BadRequestException);
        });

        /**
        * Should throw if showtime is not found.
        */
        it('should throw NotFoundException if showtime does not exist', async () => {
            const id = 99;
    
            mockShowTimeRepository.fetchShowTimeById.mockResolvedValue(null);
    
            await expect(service.deleteShowTime(id)).rejects.toThrow(NotFoundException);
        });

        /**
        * Should rethrow error from repository on failure.
        */
        it('should throw an error if repository.deleteShowTime fails', async () => {
            const id = 1;
            const existingShowTime = { id, movie_id: 1, theater: 'theater name', start_time: '14:00', end_time: '16:00', price: 25 };
    
            mockShowTimeRepository.fetchShowTimeById.mockResolvedValue(existingShowTime);
            mockShowTimeRepository.deleteShowTime.mockRejectedValue(new Error('DB delete failed'));
    
            await expect(service.deleteShowTime(id)).rejects.toThrow('DB delete failed');
        });

        /**
        * Should not call delete if showtime is not found.
        */
        it('should not call delete if showtime not found', async () => {
            const id = 1;
    
            mockShowTimeRepository.fetchShowTimeById.mockResolvedValue(null);
    
            await expect(service.deleteShowTime(id)).rejects.toThrow(NotFoundException);
            expect(mockShowTimeRepository.deleteShowTime).not.toHaveBeenCalled();
        });
    });

    describe('fetchShowTimeById', () => {

        /**
        * Should return showtime with full movie details if found.
        */
        it('should return showtime details if found', async () => {
            const id = 1;
            const showtime = {id, movie_id: 1, theater: 'theater name', start_time: '14:00', end_time: '16:00', price: 20};
            const movie = {id: 1, title: 'movie title', genre: 'test', duration: 120, rating: 8.5, release_year: 2010};

            mockShowTimeRepository.fetchShowTimeById.mockResolvedValue(showtime);
            mockMovieRepository.fetchMovieById.mockResolvedValue(movie);

            const result = await service.fetchShowTimeById(id);

            expect(result).toEqual({id: showtime.id, theater: showtime.theater, movie, 
                        start_time: showtime.start_time, end_time: showtime.end_time, price: showtime.price});
        });

        /**
        * Should throw if ID is invalid.
        */
        it('should throw BadRequestException if Id is invalid (0 or negative)', async () => {
            await expect(service.fetchShowTimeById(0)).rejects.toThrow(BadRequestException);
        });

        /**
        * Should throw if showtime is not found.
        */
        it('should throw NotFoundException if showtime not found', async () => {
            const id = 1;
            mockShowTimeRepository.fetchShowTimeById.mockResolvedValue(null);

            await expect(service.fetchShowTimeById(id)).rejects.toThrow(NotFoundException);
        });

        /**
        * Should throw if movie associated with showtime is not found.
        */
        it('should throw NotFoundException if movie for showtime is missing', async () => {
            const id = 1;
            const showtime = { id, movie_id: 99, theater: 'theater name', start_time: '15:00', end_time: '17:00', price: 25 };
        
            mockShowTimeRepository.fetchShowTimeById.mockResolvedValue(showtime);
            mockMovieRepository.fetchMovieById.mockResolvedValue(null);
        
            await expect(service.fetchShowTimeById(id)).rejects.toThrow(NotFoundException);
        });
        
        /**
        * Should rethrow error if fetchShowTimeById fails unexpectedly.
        */
        it('should throw an error if repository.fetchShowTimeById fails', async () => {
            const id = 1;
            mockShowTimeRepository.fetchShowTimeById.mockRejectedValue(new Error('DB fetch error'));

            await expect(service.fetchShowTimeById(id)).rejects.toThrow('DB fetch error');
        });
    });
})