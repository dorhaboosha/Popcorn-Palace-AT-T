/**
* showTime.service.spec.ts
* 
* This file contains unit tests for the ShowTimeService class in a NestJS application.
* 
* The tests use Jest to mock the ShowTimeRepository and MovieRepository dependencies,
* and validate the business logic for:
*  - Adding a showtime (with validations: movie existence, time range, overlaps, duration)
*  - Updating a showtime (with logic for patching, revalidating, and avoiding conflicts)
*  - Deleting a showtime (with proper error handling for missing entries)
*  - Fetching a showtime by ID
* 
* Each test validates functional correctness, error handling, and integration of service-repository logic.
*/

import { Test, TestingModule } from "@nestjs/testing";
import { ShowTimeService } from "./showTime.service";
import { ShowTimeRepository } from "./showTime.repository";
import { MovieRepository } from "../movie/movie.repository";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import { ShowTimeDto } from "./showTime.dto";

describe("ShowTimeService", () => {
  let service: ShowTimeService;
  let mockShowTimeRepository: Partial<Record<keyof ShowTimeRepository, jest.Mock>>;
  let mockMovieRepository: Partial<Record<keyof MovieRepository, jest.Mock>>;

  beforeEach(async () => {
    mockShowTimeRepository = {
      addNewShowTime: jest.fn(),
      hasOverlappingShowTime: jest.fn(),
      fetchShowTimeById: jest.fn(),
      updateShowTimeInfo: jest.fn(),
      deleteShowTime: jest.fn(),
    };

    mockMovieRepository = {
      fetchMovieById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShowTimeService,
        { provide: "ShowTimeRepository", useValue: mockShowTimeRepository },
        { provide: "MovieRepository", useValue: mockMovieRepository },
      ],
    }).compile();

    service = module.get<ShowTimeService>(ShowTimeService);
  });

  describe("addNewShowTime", () => {
    /**
    * Should create a showtime when all validations pass.
    */
    it("should create a new showtime", async () => {
      const dto: ShowTimeDto = {
        movieId: 1,
        theater: "  My Theater ",
        startTime: "2025-03-25T10:00:00.000Z",
        endTime: "2025-03-25T12:00:00.000Z",
        price: 20,
      };

      const movie = { id: 1, duration: 120 };

      mockMovieRepository.fetchMovieById!.mockResolvedValue(movie);
      mockShowTimeRepository.hasOverlappingShowTime!.mockResolvedValue(false);
      mockShowTimeRepository.addNewShowTime!.mockResolvedValue({ id: 1, ...dto });

      const result = await service.addNewShowTime(dto);

      expect(mockMovieRepository.fetchMovieById).toHaveBeenCalledWith(1);
      expect(mockShowTimeRepository.addNewShowTime).toHaveBeenCalledWith({
        ...dto,
        theater: "My Theater",
      });
      expect(result).toEqual({ id: 1, ...dto });
    });

    /**
    * Should throw if price is zero or less.
    */
    it("should throw BadRequestException for non-positive price", async () => {
      await expect(
        service.addNewShowTime({ movieId: 1, theater: "Theater", startTime: "2025-01-01T10:00:00Z", endTime: "2025-01-01T11:00:00Z", price: 0 })
      ).rejects.toThrow(BadRequestException);
    });

    /**
    * Should throw if movie is not found.
    */
    it("should throw NotFoundException if movie does not exist", async () => {
      mockMovieRepository.fetchMovieById!.mockResolvedValue(null);
      await expect(
        service.addNewShowTime({ movieId: 99, theater: "T", startTime: "2025-01-01T10:00:00Z", endTime: "2025-01-01T11:00:00Z", price: 5 })
      ).rejects.toThrow(NotFoundException);
    });

    /**
    * Should throw if startTime >= endTime.
    */
    it("should throw BadRequestException if start time is after or equal to end time", async () => {
      const movie = { id: 1, duration: 120 };
      mockMovieRepository.fetchMovieById!.mockResolvedValue(movie);

      await expect(
        service.addNewShowTime({ movieId: 1, theater: "T", startTime: "2025-01-01T12:00:00Z", endTime: "2025-01-01T10:00:00Z", price: 5 })
      ).rejects.toThrow(BadRequestException);
    });

    /**
    * Should throw if duration does not match movie.
    */
    it("should throw BadRequestException for duration mismatch", async () => {
      const movie = { id: 1, duration: 60 };
      mockMovieRepository.fetchMovieById!.mockResolvedValue(movie);

      await expect(
        service.addNewShowTime({ movieId: 1, theater: "T", startTime: "2025-01-01T10:00:00Z", endTime: "2025-01-01T12:00:00Z", price: 5 })
      ).rejects.toThrow(BadRequestException);
    });

    /**
    * Should throw if overlapping showtime exists.
    */
    it("should throw BadRequestException for overlapping showtime", async () => {
      const movie = { id: 1, duration: 120 };
      mockMovieRepository.fetchMovieById!.mockResolvedValue(movie);
      mockShowTimeRepository.hasOverlappingShowTime!.mockResolvedValue(true);

      await expect(
        service.addNewShowTime({ movieId: 1, theater: "T", startTime: "2025-01-01T10:00:00Z", endTime: "2025-01-01T12:00:00Z", price: 5 })
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe("updateShowTimeInfo", () => {
    /**
    * Should update a showtime successfully with valid data.
    */
    it("should update an existing showtime", async () => {
      const id = 1;
      const existing = { id, movieId: 1, theater: "T", startTime: "2025-01-01T10:00:00Z", endTime: "2025-01-01T12:00:00Z", price: 5 };
      const movie = { id: 1, duration: 120 };
      const update = { ...existing, price: 6 };

      mockShowTimeRepository.fetchShowTimeById!.mockResolvedValue(existing);
      mockMovieRepository.fetchMovieById!.mockResolvedValue(movie);
      mockShowTimeRepository.hasOverlappingShowTime!.mockResolvedValue(false);
      mockShowTimeRepository.updateShowTimeInfo!.mockResolvedValue(undefined);

      await expect(service.updateShowTimeInfo(id, update)).resolves.toBeUndefined();
    });

    /**
    * Should throw if showtime does not exist.
    */
    it("should throw NotFoundException if showtime not found", async () => {
      mockShowTimeRepository.fetchShowTimeById!.mockResolvedValue(null);
      await expect(service.updateShowTimeInfo(1, {} as any)).rejects.toThrow(NotFoundException);
    });

    /**
    * Should throw if movie not found during update.
    */
    it("should throw NotFoundException if movie not found during update", async () => {
      const existing = { id: 1, movieId: 1, theater: "T", startTime: "2025-01-01T10:00:00Z", endTime: "2025-01-01T12:00:00Z", price: 5 };

      mockShowTimeRepository.fetchShowTimeById!.mockResolvedValue(existing);
      mockMovieRepository.fetchMovieById!.mockResolvedValue(null);

      await expect(service.updateShowTimeInfo(1, existing)).rejects.toThrow(NotFoundException);
    });

    /**
    * Should throw if updated duration is invalid.
    */
    it("should throw BadRequestException for duration mismatch on update", async () => {
      const existing = { id: 1, movieId: 1, theater: "T", startTime: "2025-01-01T10:00:00Z", endTime: "2025-01-01T12:00:00Z", price: 5 };

      mockShowTimeRepository.fetchShowTimeById!.mockResolvedValue(existing);
      mockMovieRepository.fetchMovieById!.mockResolvedValue({ id: 1, duration: 60 });

      await expect(service.updateShowTimeInfo(1, existing)).rejects.toThrow(BadRequestException);
    });

    /**
    * Should throw if time is changed and it overlaps.
    */
    it("should throw BadRequestException if time update causes overlap", async () => {
      const existing = { id: 1, movieId: 1, theater: "T", startTime: "2025-01-01T10:00:00Z", endTime: "2025-01-01T12:00:00Z", price: 5 };
      const movie = { id: 1, duration: 120 };
      const update = { ...existing, startTime: "2025-01-01T14:00:00Z", endTime: "2025-01-01T16:00:00Z" };

      mockShowTimeRepository.fetchShowTimeById!.mockResolvedValue(existing);
      mockMovieRepository.fetchMovieById!.mockResolvedValue(movie);
      mockShowTimeRepository.hasOverlappingShowTime!.mockResolvedValue(true);

      await expect(service.updateShowTimeInfo(1, update)).rejects.toThrow(BadRequestException);
    });
  });

  describe("deleteShowTime", () => {
    /**
    * Should delete showtime if it exists.
    */
    it("should delete a showtime", async () => {
      const existing = { id: 1, movieId: 1, theater: "T", startTime: "2025-01-01T10:00:00Z", endTime: "2025-01-01T12:00:00Z", price: 5 };
      mockShowTimeRepository.fetchShowTimeById!.mockResolvedValue(existing);
      mockShowTimeRepository.deleteShowTime!.mockResolvedValue(undefined);

      await expect(service.deleteShowTime(1)).resolves.toBeUndefined();
    });

    /**
    * Should throw if showtime not found.
    */
    it("should throw NotFoundException if showtime doesn't exist", async () => {
      mockShowTimeRepository.fetchShowTimeById!.mockResolvedValue(null);
      await expect(service.deleteShowTime(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe("fetchShowTimeById", () => {
    /**
    * Should fetch a showtime if it exists.
    */
    it("should fetch and return a showtime", async () => {
      const showtime = { id: 1, movieId: 1, theater: "T", startTime: "2025-01-01T10:00:00Z", endTime: "2025-01-01T12:00:00Z", price: 5 };

      mockShowTimeRepository.fetchShowTimeById!.mockResolvedValue(showtime);
      const result = await service.fetchShowTimeById(1);

      expect(result).toEqual(showtime);
    });

    /**
    * Should throw if not found.
    */
    it("should throw NotFoundException if showtime not found", async () => {
      mockShowTimeRepository.fetchShowTimeById!.mockResolvedValue(null);
      await expect(service.fetchShowTimeById(1)).rejects.toThrow(NotFoundException);
    });
  });
});