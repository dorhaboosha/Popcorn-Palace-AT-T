/**
 * booking.service.spec.ts
 * 
 * This file contains unit tests for the `BookingService`, which is responsible for
 * handling core business logic related to creating bookings for movie showtimes.
 * 
 * These tests cover:
 * - Successful booking
 * - Edge cases like seat duplication, full theaters, and missing records
 * - Input normalization and validation
 */

import { Test, TestingModule } from '@nestjs/testing';
import { BookingService } from './booking.service';
import { BookingRepository } from './booking.repository';
import { ShowTimeRepository } from 'src/showTime/showTime.repository';
import { MovieRepository } from 'src/movie/movie.repository';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { BookingDto } from './booking.dto';

describe('BookingService', () => {
  let service: BookingService;
  let mockBookingRepository: Partial<Record<keyof BookingRepository, jest.Mock>>;
  let mockShowTimeRepository: Partial<Record<keyof ShowTimeRepository, jest.Mock>>;
  let mockMovieRepository: Partial<Record<keyof MovieRepository, jest.Mock>>;

  beforeEach(async () => {
    mockBookingRepository = {
      addNewBooking: jest.fn(),
      isSeatTaken: jest.fn(),
      isTheaterFull: jest.fn(),
      getBookingsForShowTime: jest.fn()
    };

    mockShowTimeRepository = {
      fetchShowTimeById: jest.fn()
    };

    mockMovieRepository = {
      fetchMovieById: jest.fn()
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingService,
        { provide: BookingRepository, useValue: mockBookingRepository },
        { provide: 'ShowTimeRepository', useValue: mockShowTimeRepository },
        { provide: 'MovieRepository', useValue: mockMovieRepository },
      ],
    }).compile();

    service = module.get<BookingService>(BookingService);
  });

  /**
   * Should successfully create a booking when all validations pass.
   */
  it('should successfully add a booking', async () => {
    const bookingData: BookingDto = {
      showtimeId: 1,
      seatNumber: 10,
      userId: 'abcabcab-1111-2222-3333-abcabcabcabc'
    };

    const showtime = { id: 1, movieId: 2 };
    const movie = { id: 2, title: 'Movie' };

    mockShowTimeRepository.fetchShowTimeById.mockResolvedValue(showtime);
    mockMovieRepository.fetchMovieById.mockResolvedValue(movie);
    mockBookingRepository.isTheaterFull.mockResolvedValue(false);
    mockBookingRepository.isSeatTaken.mockResolvedValue(false);
    mockBookingRepository.getBookingsForShowTime.mockResolvedValue([]);
    mockBookingRepository.addNewBooking.mockResolvedValue('booking-id-123');

    const result = await service.addNewBooking(bookingData);

    expect(result).toEqual({ bookingId: 'booking-id-123' });
    expect(mockBookingRepository.addNewBooking).toHaveBeenCalled();
  });

  /**
   * Should throw NotFoundException if showtime does not exist.
   */
  it('should throw NotFoundException if showtime not found', async () => {
    const data: BookingDto = {
      showtimeId: 1,
      seatNumber: 10,
      userId: 'abcabcab-1111-2222-3333-abcabcabcabc'
    };

    mockShowTimeRepository.fetchShowTimeById.mockResolvedValue(null);

    await expect(service.addNewBooking(data)).rejects.toThrow(NotFoundException);
  });

  /**
   * Should throw NotFoundException if the associated movie does not exist.
   */
  it('should throw NotFoundException if movie not found', async () => {
    const data: BookingDto = {
      showtimeId: 1,
      seatNumber: 10,
      userId: 'abcabcab-1111-2222-3333-abcabcabcabc'
    };

    const showtime = { id: 1, movieId: 2 };
    mockShowTimeRepository.fetchShowTimeById.mockResolvedValue(showtime);
    mockMovieRepository.fetchMovieById.mockResolvedValue(null);

    await expect(service.addNewBooking(data)).rejects.toThrow(NotFoundException);
  });

  /**
   * Should throw BadRequestException if theater is already full.
   */
  it('should throw BadRequestException if theater is full', async () => {
    const data: BookingDto = {
      showtimeId: 1,
      seatNumber: 10,
      userId: 'abcabcab-1111-2222-3333-abcabcabcabc'
    };

    const showtime = { id: 1, movieId: 2 };
    const movie = { id: 2, title: 'Movie' };

    mockShowTimeRepository.fetchShowTimeById.mockResolvedValue(showtime);
    mockMovieRepository.fetchMovieById.mockResolvedValue(movie);
    mockBookingRepository.isTheaterFull.mockResolvedValue(true);

    await expect(service.addNewBooking(data)).rejects.toThrow(BadRequestException);
  });

  /**
   * Should throw BadRequestException if the requested seat is already taken.
   */
  it('should throw BadRequestException if seat is already booked', async () => {
    const data: BookingDto = {
      showtimeId: 1,
      seatNumber: 10,
      userId: 'abcabcab-1111-2222-3333-abcabcabcabc'
    };

    const showtime = { id: 1, movieId: 2 };
    const movie = { id: 2, title: 'Movie' };

    mockShowTimeRepository.fetchShowTimeById.mockResolvedValue(showtime);
    mockMovieRepository.fetchMovieById.mockResolvedValue(movie);
    mockBookingRepository.isTheaterFull.mockResolvedValue(false);
    mockBookingRepository.isSeatTaken.mockResolvedValue(true);
    mockBookingRepository.getBookingsForShowTime.mockResolvedValue([]);

    await expect(service.addNewBooking(data)).rejects.toThrow(BadRequestException);
  });

  /**
   * Should throw BadRequestException if the same user already booked this seat.
   */
  it('should throw BadRequestException if user already booked this seat', async () => {
    const data: BookingDto = {
      showtimeId: 1,
      seatNumber: 10,
      userId: 'abcabcab-1111-2222-3333-abcabcabcabc'
    };

    const showtime = { id: 1, movieId: 2 };
    const movie = { id: 2, title: 'Movie' };
    const bookings = [{ userId: 'abcabcab-1111-2222-3333-abcabcabcabc', seatNumber: 10 }];

    mockShowTimeRepository.fetchShowTimeById.mockResolvedValue(showtime);
    mockMovieRepository.fetchMovieById.mockResolvedValue(movie);
    mockBookingRepository.isTheaterFull.mockResolvedValue(false);
    mockBookingRepository.isSeatTaken.mockResolvedValue(false);
    mockBookingRepository.getBookingsForShowTime.mockResolvedValue(bookings);

    await expect(service.addNewBooking(data)).rejects.toThrow(BadRequestException);
  });

  /**
   * Should throw a generic error if booking insertion fails unexpectedly.
   */
  it('should throw error if DB insert fails', async () => {
    const data: BookingDto = {
      showtimeId: 1,
      seatNumber: 10,
      userId: 'abcabcab-1111-2222-3333-abcabcabcabc'
    };

    const showtime = { id: 1, movieId: 2 };
    const movie = { id: 2, title: 'Movie' };

    mockShowTimeRepository.fetchShowTimeById.mockResolvedValue(showtime);
    mockMovieRepository.fetchMovieById.mockResolvedValue(movie);
    mockBookingRepository.isTheaterFull.mockResolvedValue(false);
    mockBookingRepository.isSeatTaken.mockResolvedValue(false);
    mockBookingRepository.getBookingsForShowTime.mockResolvedValue([]);
    mockBookingRepository.addNewBooking.mockRejectedValue(new Error('Insert failed'));

    await expect(service.addNewBooking(data)).rejects.toThrow(Error);
  });
});
