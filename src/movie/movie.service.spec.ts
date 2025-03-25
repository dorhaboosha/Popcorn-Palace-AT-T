/**
* movie.service.spec.ts
*
* This file contains unit tests for the MovieService class using Jest and the NestJS testing framework.
* It tests the core business logic for creating, updating, fetching, and deleting movies.
* Repository methods are mocked to isolate and validate service logic and behavior.
*/

import { Test, TestingModule } from '@nestjs/testing';
import { MovieService } from './movie.service';
import { MovieRepository } from './movie.repository';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Movie } from './movie.entity';
import { MovieDto } from './movie.dto';

describe('MovieService', () => {
  let service: MovieService;
  let mockMovieRepository: Partial<Record<keyof MovieRepository, jest.Mock>>;

  beforeEach(async () => {
    mockMovieRepository = {
      getAllMovies: jest.fn(),
      findMovieByTitle: jest.fn(),
      addNewMovie: jest.fn(),
      updateMovieInfo: jest.fn(),
      deleteMovie: jest.fn()
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MovieService,
        { provide: 'MovieRepository', useValue: mockMovieRepository }
      ]
    }).compile();

    service = module.get<MovieService>(MovieService);
  });

  describe('fetchAllMovies', () => {
    
    /**
    * Should return all movies when they exist in the database.
    */
    it('should return all movies', async () => {
      const movies: Movie[] = [{ id: 1, title: 'movie', genre: 'test', duration: 100, rating: 8, releaseYear: 2024 }];
      mockMovieRepository.getAllMovies.mockResolvedValue(movies);

      const result = await service.fetchAllMovies();
      expect(result).toEqual(movies);
    });

    /**
    * Should throw BadRequestException when there are no movies in the database.
    */
    it('should throw if no movies exist', async () => {
      mockMovieRepository.getAllMovies.mockResolvedValue([]);
      await expect(service.fetchAllMovies()).rejects.toThrow(BadRequestException);
    });

    /**
    * Should throw a generic error when repository fails.
    */
    it('should throw if repository fails', async () => {
      mockMovieRepository.getAllMovies.mockRejectedValue(new Error('DB error'));
      await expect(service.fetchAllMovies()).rejects.toThrow('DB error');
    });
  });

  describe('addNewMovie', () => {
    const data: MovieDto = { title: ' Inception ', genre: ' SCI-FI ', duration: 148, rating: 9, releaseYear: 2010};

    /**
    * Should add a movie if it doesn't already exist.
    */
    it('should add a new movie if it does not exist', async () => {
      mockMovieRepository.findMovieByTitle.mockResolvedValue(null);
      await service.addNewMovie(data);

      expect(mockMovieRepository.addNewMovie).toHaveBeenCalledWith({ title: 'inception', genre: 'sci-fi', duration: 148,
        rating: 9, releaseYear: 2010});
    });

    /**
    * Should throw BadRequestException if a movie with the same title exists.
    */
    it('should throw if duplicate movie found', async () => {
      mockMovieRepository.findMovieByTitle.mockResolvedValue({ id: 1 });
      await expect(service.addNewMovie(data)).rejects.toThrow(BadRequestException);
    });

    /**
    * Should throw an error if repository.addNewMovie fails.
    */
    it('should throw if repo fails', async () => {
      mockMovieRepository.findMovieByTitle.mockResolvedValue(null);
      mockMovieRepository.addNewMovie.mockRejectedValue(new Error('DB error'));
      await expect(service.addNewMovie(data)).rejects.toThrow('DB error');
    });
  });

  describe('updateMovieInfo', () => {
    const existingMovie: Movie = { id: 1, title: 'inception', genre: 'sci-fi', duration: 148, rating: 9, releaseYear: 2010};

    const updatedData: MovieDto = {title: ' Interstellar ', genre: ' Sci-fi ', duration: 169, rating: 8.6, releaseYear: 2014};

    /**
    * Should update a movie successfully if it exists and title doesn't conflict.
    */
    it('should update a movie if found and no title conflict', async () => {
      mockMovieRepository.findMovieByTitle.mockResolvedValueOnce(existingMovie); 
      mockMovieRepository.findMovieByTitle.mockResolvedValueOnce(null);
      await service.updateMovieInfo('inception', updatedData);

      expect(mockMovieRepository.updateMovieInfo).toHaveBeenCalledWith('inception', {title: 'interstellar',
        genre: 'sci-fi', duration: 169, rating: 8.6, releaseYear: 2014});
    });

    /**
    * Should throw NotFoundException if movie with given title doesn't exist.
    */
    it('should throw if movie to update not found', async () => {
      mockMovieRepository.findMovieByTitle.mockResolvedValue(null);
      await expect(service.updateMovieInfo('missing', updatedData)).rejects.toThrow(NotFoundException);
    });

    /**
    * Should throw BadRequestException if title is changed to one that already exists.
    */
    it('should throw if changing to a duplicate title', async () => {
      mockMovieRepository.findMovieByTitle.mockResolvedValueOnce(existingMovie);
      mockMovieRepository.findMovieByTitle.mockResolvedValueOnce({ id: 2 });
      await expect(service.updateMovieInfo('inception', updatedData)).rejects.toThrow(BadRequestException);
    });

    /**
    * Should throw a DB error if repository update fails.
    */
    it('should throw if repository fails', async () => {
      mockMovieRepository.findMovieByTitle.mockResolvedValueOnce(existingMovie);
      mockMovieRepository.findMovieByTitle.mockResolvedValueOnce(null);
      mockMovieRepository.updateMovieInfo.mockRejectedValue(new Error('DB error'));
      await expect(service.updateMovieInfo('inception', updatedData)).rejects.toThrow('DB error');
    });
  });

  describe('deleteMovie', () => {
    
    /**
    * Should delete movie if it exists in the database.
    */
    it('should delete movie if exists', async () => {
      mockMovieRepository.findMovieByTitle.mockResolvedValue({ id: 1 });
      await service.deleteMovie('Inception');
      expect(mockMovieRepository.deleteMovie).toHaveBeenCalledWith('inception');
    });

    /**
    * Should throw NotFoundException if movie doesn't exist.
    */
    it('should throw if movie not found', async () => {
      mockMovieRepository.findMovieByTitle.mockResolvedValue(null);
      await expect(service.deleteMovie('unknown')).rejects.toThrow(NotFoundException);
    });

    /**
    * Should throw a DB error if repository fails during delete.
    */
    it('should throw if repo fails', async () => {
      mockMovieRepository.findMovieByTitle.mockResolvedValue({ id: 1 });
      mockMovieRepository.deleteMovie.mockRejectedValue(new Error('DB error'));
      await expect(service.deleteMovie('inception')).rejects.toThrow('DB error');
    });
  });
});
