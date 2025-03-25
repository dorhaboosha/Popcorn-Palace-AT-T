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
import { ShowTimeDto } from "./showTime.dto";

describe('ShowTimeController', () => {
    let controller: ShowTimeController;
    let mockShowTimeService: Partial<Record<keyof ShowTimeService, jest.Mock>>;

    beforeEach(async () => {
        mockShowTimeService = {
            addNewShowTime: jest.fn(),
            fetchShowTimeById: jest.fn(),
            updateShowTimeInfo: jest.fn(),
            deleteShowTime: jest.fn()
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [ShowTimeController],
            providers: [{ provide: ShowTimeService, useValue: mockShowTimeService }]
        }).compile();

        controller = module.get<ShowTimeController>(ShowTimeController);
    });

    describe('AddNewShowTime', () => {

        /**
        * Should add a new showtime and return a success message.
        */
        it('should add a new showtime successfully', async () => {
            const dto: ShowTimeDto = {
                movieId: 1,
                theater: 'Theater A',
                startTime: '2025-03-25T10:00:00Z',
                endTime: '2025-03-25T12:00:00Z',
                price: 30
            };

            mockShowTimeService.addNewShowTime.mockResolvedValue({
                id: 1,
                ...dto
            });

            const result = await controller.addNewShowTime(dto);
            expect(result).toEqual({
                id: 1,
                ...dto
            });
        });

        /**
        * Should throw BadRequestException if the showtime is invalid or overlaps.
        */
        it('should throw BadRequestException if invalid', async () => {
            const dto: ShowTimeDto = {
                movieId: 1,
                theater: 'Theater A',
                startTime: 'invalid',
                endTime: 'invalid',
                price: 0
            };

            mockShowTimeService.addNewShowTime.mockRejectedValue(new BadRequestException('Invalid showtime'));

            await expect(controller.addNewShowTime(dto)).rejects.toThrow(BadRequestException);
        });

        /**
        * Should throw NotFoundException if the movie ID is not found.
        */
        it('should throw NotFoundException if movie does not exist', async () => {
            const dto: ShowTimeDto = {
                movieId: 999,
                theater: 'Theater A',
                startTime: '2025-03-25T10:00:00Z',
                endTime: '2025-03-25T12:00:00Z',
                price: 30
            };

            mockShowTimeService.addNewShowTime.mockRejectedValue(new NotFoundException('Movie not found'));

            await expect(controller.addNewShowTime(dto)).rejects.toThrow(NotFoundException);
        });
    });

    describe('fetchShowTimeById', () => {

        /**
        * Should return the showtime if found.
        */
        it('should return showtime by ID', async () => {
            const id = 1;
            const showtime = {
                id,
                movieId: 1,
                theater: 'Theater A',
                startTime: '2025-03-25T10:00:00Z',
                endTime: '2025-03-25T12:00:00Z',
                price: 30
            };

            mockShowTimeService.fetchShowTimeById.mockResolvedValue(showtime);

            const result = await controller.fetchShowTimeById(id);
            expect(result).toEqual(showtime);
        });

        /**
        * Should throw BadRequestException if ID is invalid.
        */
        it('should throw BadRequestException for invalid ID', async () => {
            mockShowTimeService.fetchShowTimeById.mockRejectedValue(new BadRequestException('Invalid ID'));

            await expect(controller.fetchShowTimeById(0)).rejects.toThrow(BadRequestException);
        });

        /**
        * Should throw NotFoundException if showtime is not found.
        */
        it('should throw NotFoundException if showtime does not exist', async () => {
            mockShowTimeService.fetchShowTimeById.mockRejectedValue(new NotFoundException('Not found'));

            await expect(controller.fetchShowTimeById(999)).rejects.toThrow(NotFoundException);
        });
    });

    describe('updateShowTimeInfo', () => {

        /**
        * Should update an existing showtime and return success message.
        */
        it('should update showtime successfully', async () => {
            const id = 1;
            const dto: ShowTimeDto = {
                movieId: 1,
                theater: 'Updated Theater',
                startTime: '2025-03-25T13:00:00Z',
                endTime: '2025-03-25T15:00:00Z',
                price: 35
            };

            mockShowTimeService.updateShowTimeInfo.mockResolvedValue(undefined);

            const result = await controller.updateShowTimeInfo(id, dto);
            expect(result).toEqual({ message: `Showtime with ID ${id} successfully updated.` });
        });

        /**
        * Should throw BadRequestException if data is invalid.
        */
        it('should throw BadRequestException for invalid input', async () => {
            const id = 1;
            const dto: ShowTimeDto = {
                movieId: 1,
                theater: '',
                startTime: '',
                endTime: '',
                price: 0
            };

            mockShowTimeService.updateShowTimeInfo.mockRejectedValue(new BadRequestException('Invalid input'));

            await expect(controller.updateShowTimeInfo(id, dto)).rejects.toThrow(BadRequestException);
        });

        /**
        * Should throw NotFoundException if showtime or movie is not found.
        */
        it('should throw NotFoundException if movie or showtime is not found', async () => {
            const id = 1;
            const dto: ShowTimeDto = {
                movieId: 999,
                theater: 'Test',
                startTime: '2025-03-25T10:00:00Z',
                endTime: '2025-03-25T12:00:00Z',
                price: 30
            };

            mockShowTimeService.updateShowTimeInfo.mockRejectedValue(new NotFoundException('Movie not found'));

            await expect(controller.updateShowTimeInfo(id, dto)).rejects.toThrow(NotFoundException);
        });
    });

    describe('deleteShowTime', () => {

        /**
        * Should delete a showtime and return success message.
        */
        it('should delete a showtime', async () => {
            const id = 1;

            mockShowTimeService.deleteShowTime.mockResolvedValue(undefined);

            const result = await controller.deleteShowTime(id);
            expect(result).toEqual({ message: `Showtime with ID ${id} successfully deleted.` });
        });

        /**
        * Should throw BadRequestException if ID is invalid.
        */
        it('should throw BadRequestException for invalid ID', async () => {
            mockShowTimeService.deleteShowTime.mockRejectedValue(new BadRequestException('Invalid ID'));

            await expect(controller.deleteShowTime(0)).rejects.toThrow(BadRequestException);
        });

        /**
        * Should throw NotFoundException if showtime does not exist.
        */
        it('should throw NotFoundException if showtime does not exist', async () => {
            mockShowTimeService.deleteShowTime.mockRejectedValue(new NotFoundException('Showtime not found'));

            await expect(controller.deleteShowTime(999)).rejects.toThrow(NotFoundException);
        });
    });
});
