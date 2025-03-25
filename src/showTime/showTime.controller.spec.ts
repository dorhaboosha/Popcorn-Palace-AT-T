/**
* showTime.controller.spec.ts
* 
* This file contains unit tests for the ShowTimeController in a NestJS application.
* It uses Jest to mock the ShowTimeService and test all controller-level endpoints:
* - Creating a new showtime
* - Fetching a showtime by ID
* - Updating an existing showtime
* - Deleting a showtime
* 
* Each test validates correct responses and error handling for various edge cases,
* including invalid inputs, not found resources, and duplicate showtimes.
*/

import { Test, TestingModule } from "@nestjs/testing";
import { ShowTimeController } from "./showTime.controller";
import { ShowTimeService } from "./showTime.service";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import { CreateShowTimeDto } from "./create-showTime.dto";
import { UpdateShowTimeDto } from "./update-showTime.dto";

describe('ShowTimeController', () => {
    let controller: ShowTimeController;
    let mockShowTimeService: Partial<Record<keyof ShowTimeService, jest.Mock>>;

    beforeEach(async () => {
        mockShowTimeService = {
            addNewShowTime: jest.fn(),
            fetchShowTimeById: jest.fn(),
            updateShowTimeInfo: jest.fn(),
            deleteShowTime: jest.fn()
        }

        const module: TestingModule = await Test.createTestingModule(
            {controllers: [ShowTimeController], providers: [{provide: ShowTimeService, useValue: mockShowTimeService}]
            }).compile();

        controller = module.get<ShowTimeController>(ShowTimeController);
    });

    describe('AddNewShowTime', () => {
        
        /**
        * Should add a new showtime and return a success message.
        */
        it('should add a new showtime successfully', async () => {
            const showtime: CreateShowTimeDto = {movie_title: 'Movie test', movie_release_year: 2010,
                theater: 'Theater test', start_time: '14:00', end_time: '16:00', price: 15.7};
            
            mockShowTimeService.addNewShowTime.mockResolvedValue(undefined);

            const result = await controller.addNewShowTime(showtime);
            expect(result).toEqual({message: 'Showtime successfully added.'});
            expect(mockShowTimeService.addNewShowTime).toHaveBeenCalledWith(showtime);
        });

        /**
        * Should throw BadRequestException if the input data is invalid.
        */
        it('should throw BadRequestException if data is invalid', async () =>{
            const showtime: CreateShowTimeDto = {movie_title: '', movie_release_year: 2010, theater: '',
                    start_time: '14:00', end_time: '16:00', price: 15.7};

            mockShowTimeService.addNewShowTime.mockRejectedValue(new BadRequestException('Invalid input'));

            await expect(controller.addNewShowTime(showtime)).rejects.toThrow(BadRequestException);
        });

        /**
        * Should throw BadRequestException if a showtime with the same details already exists.
        */
        it('should throw BadRequestException if there is a showtime with the same details', async () => {
            const showtime: CreateShowTimeDto = {movie_title: 'movie test', movie_release_year: 2010, theater: 'theater test',
                    start_time: '14:00', end_time: '16:00', price: 15.7};
            
            mockShowTimeService.addNewShowTime.mockRejectedValue(new BadRequestException('Duplicate showtime'));
            await expect(controller.addNewShowTime(showtime)).rejects.toThrow(BadRequestException);
        });

        /**
        * Should throw NotFoundException if the movie is not found.
        */
        it('should throw NotFoundException if the movie is not found', async () => {
            const showtime: CreateShowTimeDto = {movie_title: 'movie test', movie_release_year: 2010, theater: 'theater test',
                    start_time: '14:00', end_time: '16:00', price: 15.7};
            
            mockShowTimeService.addNewShowTime.mockRejectedValue(new NotFoundException('Movie not found'));
            await expect(controller.addNewShowTime(showtime)).rejects.toThrow(NotFoundException);
        });
    });

    describe('GetShowTimeById', () => {
        
        /**
        * Should fetch and return showtime by valid ID.
        */
        it('should fetch showtime by ID successfully', async () => {
            const id = 1;
            const showtime = {id, theater: 'theater test', movie: {}, start_time: '14:00', end_time: '16:00', price: 15.7};

            mockShowTimeService.fetchShowTimeById.mockResolvedValue(showtime);
            const result = await controller.fetchShowTimeById(id);
            expect(result).toEqual(showtime);
        });

        /**
        * Should throw BadRequestException if the ID is invalid.
        */
        it('should throw BadRequestException if ID is invalid', async () => {
            mockShowTimeService.fetchShowTimeById.mockRejectedValue(new BadRequestException('Invalid ID'));
            await expect(controller.fetchShowTimeById(0)).rejects.toThrow(BadRequestException);
        });

        /**
        * Should throw NotFoundException if the showtime is not found.
        */
        it('should throw NotFoundException if showtime is not found', async () => {
            mockShowTimeService.fetchShowTimeById.mockRejectedValue(new NotFoundException('Showtime not found'));
            await expect(controller.fetchShowTimeById(999)).rejects.toThrow(NotFoundException);
        });

        /**
        * Should throw NotFoundException if the associated movie is not found.
        */
        it('should throw NotFoundException if movie is not found', async () => {
            mockShowTimeService.fetchShowTimeById.mockRejectedValue(new NotFoundException('Movie not found'));
            await expect(controller.fetchShowTimeById(1)).rejects.toThrow(NotFoundException);
        });
    });

    describe('UpdateShowTime', () => {
        /**
        * Should update the showtime with the given ID and data.
        */
        it('should update showtime successfully', async () => {
            const id = 1;
            const update: UpdateShowTimeDto = {price: 30.6};
            
            mockShowTimeService.updateShowTimeInfo.mockResolvedValue(undefined);

            const result = await controller.updateShowTimeInfo(id, update);
            expect(result).toEqual({message: `Showtime with ID ${id} successfully updated.`});
        });

        /**
        * Should throw BadRequestException if the ID is invalid.
        */
        it('shpould throw BadRequestException if ID is invalid', async () => {
            const update: UpdateShowTimeDto = {price: 25.8};

            mockShowTimeService.updateShowTimeInfo.mockRejectedValue(new BadRequestException('Invalid ID'));
            await expect(controller.updateShowTimeInfo(0, update)).rejects.toThrow(BadRequestException);
        });

        /**
        * Should throw BadRequestException if update data is invalid or empty.
        */
        it('should throw BadRequestException if data is invalid', async () => {
            const id = 1;
            const update: UpdateShowTimeDto = {};

            mockShowTimeService.updateShowTimeInfo.mockRejectedValue(new BadRequestException('Invalid data'));
            await expect(controller.updateShowTimeInfo(id, update)).rejects.toThrow(BadRequestException);
        });

        /**
        * Should throw NotFoundException if the showtime to update is not found.
        */
        it('should throw NotFoundException if showtime is not found', async () => {
            const id = 999;
            const update: UpdateShowTimeDto = {price: 25.8};

            mockShowTimeService.updateShowTimeInfo.mockRejectedValue(new NotFoundException('Showtime not found'));
            await expect(controller.updateShowTimeInfo(id, update)).rejects.toThrow(NotFoundException);
        });

        /**
        * Should throw NotFoundException if the new movie title does not match any existing movie.
        */
        it('should throw NotFoundException if movie is not found', async () => {
            const id = 1;
            const update: UpdateShowTimeDto = {movie_title: 'movie', movie_release_year: 2010};

            mockShowTimeService.updateShowTimeInfo.mockRejectedValue(new NotFoundException('Movie not found'));
            await expect(controller.updateShowTimeInfo(id, update)).rejects.toThrow(NotFoundException);
        });
    });

    describe('DeleteShowTime', () => {
        /**
        * Should delete a showtime by ID and return a success message.
        */
        it('should delete showtime successfully', async () => {
            const id = 1;

            mockShowTimeService.deleteShowTime.mockResolvedValue(undefined);

            const result = await controller.deleteShowTime(id);
            expect(result).toEqual({message: `Showtime with ID ${id} successfully deleted.`});
        });

        /**
        * Should throw BadRequestException if ID is invalid.
        */
        it('should throw BadRequestException if ID is invalid', async () => {
            mockShowTimeService.deleteShowTime.mockRejectedValue(new BadRequestException('Invalid ID'));
            await expect(controller.deleteShowTime(0)).rejects.toThrow(BadRequestException);
        });
        
        /**
        * Should throw NotFoundException if showtime does not exist.
        */
        it('should throw NotFoundException if showtime is not found', async () => {
            mockShowTimeService.deleteShowTime.mockRejectedValue(new NotFoundException('Showtime not found'));
            await expect(controller.deleteShowTime(999)).rejects.toThrow(NotFoundException);
        });
    });
});