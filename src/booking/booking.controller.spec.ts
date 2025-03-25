/**
 * booking.controller.spec.ts
 *
 * This file contains unit tests for the `BookingController` in a NestJS application.
 * It tests the `/bookings` POST endpoint to ensure proper service interaction and error handling.
 * 
 * The tests use mocked `BookingService` and verify:
 * - Successful booking creation
 * - Proper exception propagation (BadRequest, NotFound, etc.)
 * - Unexpected failure handling
 */

import { Test, TestingModule } from '@nestjs/testing';
import { BookingController } from './booking.controller';
import { BookingService } from './booking.service';
import { BookingDto } from './booking.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('BookingController', () => {
  let controller: BookingController;
  let mockBookingService: Partial<Record<keyof BookingService, jest.Mock>>;

  beforeEach(async () => {
    mockBookingService = {
      addNewBooking: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [BookingController],
      providers: [{ provide: BookingService, useValue: mockBookingService }],
    }).compile();

    controller = module.get<BookingController>(BookingController);
  });

  /**
   * Should return bookingId when booking is successful.
   */
  it('should return bookingId on success', async () => {
    const data: BookingDto = {
      showtimeId: 1,
      seatNumber: 10,
      userId: '123e4567-e89b-12d3-a456-426614174000',
    };

    const fakeBookingId = 'abc123-booking-id';
    mockBookingService.addNewBooking!.mockResolvedValue({ bookingId: fakeBookingId });

    const result = await controller.addNewBooking(data);
    expect(result).toEqual({ bookingId: fakeBookingId });
    expect(mockBookingService.addNewBooking).toHaveBeenCalledWith(data);
  });

  /**
   * Should throw BadRequestException if the seat is already taken.
   */
  it('should throw BadRequestException if seat is taken', async () => {
    const data: BookingDto = {
      showtimeId: 1,
      seatNumber: 11,
      userId: 'uuid-123',
    };

    mockBookingService.addNewBooking!.mockRejectedValue(
      new BadRequestException('Seat already booked')
    );

    await expect(controller.addNewBooking(data)).rejects.toThrow(BadRequestException);
  });

  /**
   * Should throw BadRequestException if the theater is full.
   */
  it('should throw BadRequestException if theater is full', async () => {
    const data: BookingDto = {
      showtimeId: 2,
      seatNumber: 55,
      userId: 'uuid-123',
    };

    mockBookingService.addNewBooking!.mockRejectedValue(
      new BadRequestException('Theater is full')
    );

    await expect(controller.addNewBooking(data)).rejects.toThrow(BadRequestException);
  });

  /**
   * Should throw BadRequestException if user already booked the seat.
   */
  it('should throw BadRequestException if user already booked this seat', async () => {
    const data: BookingDto = {
      showtimeId: 2,
      seatNumber: 99,
      userId: 'uuid-duplicate',
    };

    mockBookingService.addNewBooking!.mockRejectedValue(
      new BadRequestException('Duplicate booking')
    );

    await expect(controller.addNewBooking(data)).rejects.toThrow(BadRequestException);
  });

  /**
   * Should throw NotFoundException if showtime does not exist.
   */
  it('should throw NotFoundException if showtime not found', async () => {
    const data: BookingDto = {
      showtimeId: 99,
      seatNumber: 15,
      userId: 'uuid-x',
    };

    mockBookingService.addNewBooking!.mockRejectedValue(
      new NotFoundException('Showtime not found')
    );

    await expect(controller.addNewBooking(data)).rejects.toThrow(NotFoundException);
  });

  /**
   * Should throw NotFoundException if movie does not exist.
   */
  it('should throw NotFoundException if movie not found', async () => {
    const data: BookingDto = {
      showtimeId: 5,
      seatNumber: 7,
      userId: 'uuid-x',
    };

    mockBookingService.addNewBooking!.mockRejectedValue(
      new NotFoundException('Movie not found')
    );

    await expect(controller.addNewBooking(data)).rejects.toThrow(NotFoundException);
  });

  /**
   * Should throw generic Error if an unexpected error occurs.
   */
  it('should throw generic error on unexpected failure', async () => {
    const data: BookingDto = {
      showtimeId: 1,
      seatNumber: 12,
      userId: 'uuid-z',
    };

    mockBookingService.addNewBooking!.mockRejectedValue(new Error('Unexpected DB error'));

    await expect(controller.addNewBooking(data)).rejects.toThrow(Error);
  });
});
