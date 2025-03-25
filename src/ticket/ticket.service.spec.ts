/**
* ticket.service.spec.ts
* 
* This file contains unit tests for the `TicketService`, which is responsible for 
* handling the core business logic of ticket creation in the movie booking system.
* 
* These tests cover:
* - Successful ticket creation
* - Error scenarios such as full theaters, taken seats, missing showtimes/movies, 
*   duplicate bookings, and DB insertion failures
* - Input normalization logic (e.g., trimming and lowercasing customer name)
*/

import { Test, TestingModule } from "@nestjs/testing";
import { TicketService } from "./ticket.service";
import { TicketRepository } from "./ticket.repository";
import { ShowTimeRepository } from "src/showTime/showTime.repository";
import { MovieRepository } from "src/movie/movie.repository";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import { CreateTicketDto } from "./create-ticket.dto";

describe('TicketService', () => {
    let service: TicketService;
    let mockTicketRepository: Partial<Record<keyof TicketRepository, jest.Mock>>;
    let mockShowTimeRepository: Partial<Record<keyof ShowTimeRepository, jest.Mock>>;
    let mockMovieRepository: Partial<Record<keyof MovieRepository, jest.Mock>>;

    beforeEach(async () => {
        mockTicketRepository = {
            addNewTicket: jest.fn(),
            isSeatTaken: jest.fn(),
            isTheaterFull: jest.fn(),
            getTicketsForShowTime: jest.fn()
        };

        mockShowTimeRepository = {findShowTimeByTheaterAndStartTime: jest.fn()};
        mockMovieRepository = {fetchMovieById: jest.fn()};

        const module: TestingModule = await Test.createTestingModule(
            { providers: [TicketService, { provide: TicketRepository, useValue: mockTicketRepository},
                            {provide:'ShowTimeRepository', useValue: mockShowTimeRepository},
                            {provide:'MovieRepository', useValue: mockMovieRepository}],}).compile();
        
        service = module.get<TicketService>(TicketService);
    });

    /**
    * Should successfully create a ticket when all inputs are valid.
    */
    it('should successfully add a ticket', async () => {
        const ticketData : CreateTicketDto = {movie_title: 'Movie title', movie_theater: 'Theater name', movie_start_time: '14:00',
                                                customer_name: 'Customer name', seat_number: 6};
                            
        const showtime = {id: 1, movie_id: 2};
        const movie = {id: 2, title: 'Movie title'};
        const tickets = [];

        mockShowTimeRepository.findShowTimeByTheaterAndStartTime.mockResolvedValue(showtime);
        mockMovieRepository.fetchMovieById.mockResolvedValue(movie);
        mockTicketRepository.isTheaterFull.mockResolvedValue(false);
        mockTicketRepository.isSeatTaken.mockResolvedValue(false);
        mockTicketRepository.getTicketsForShowTime.mockResolvedValue(tickets);
        mockTicketRepository.addNewTicket.mockResolvedValue(undefined);

        await service.addNewTicket(ticketData);

        expect(mockTicketRepository.addNewTicket).toHaveBeenCalled();
    });

    /**
    * Should throw NotFoundException if no matching showtime is found.
    */
    it('should throw NotFoundException if showtime not found', async () => {
        const ticketData : CreateTicketDto = {movie_title: 'Movie title', movie_theater: 'Theater name', movie_start_time: '14:00',
            customer_name: 'Customer name', seat_number: 6};

        mockShowTimeRepository.findShowTimeByTheaterAndStartTime.mockResolvedValue(null);

        await expect(service.addNewTicket(ticketData)).rejects.toThrow(NotFoundException);
    });

    /**
    * Should throw NotFoundException if associated movie is not found.
    */
    it('should throw NotFoundException if movie not found', async () => {
        const ticketData : CreateTicketDto = {movie_title: 'Movie title', movie_theater: 'Theater name', movie_start_time: '14:00',
            customer_name: 'Customer name', seat_number: 6};
        
        const showtime = {id: 1, movie_id: 2};

        mockShowTimeRepository.findShowTimeByTheaterAndStartTime.mockResolvedValue(showtime);
        mockMovieRepository.fetchMovieById.mockResolvedValue(null);

        await expect(service.addNewTicket(ticketData)).rejects.toThrow(NotFoundException);
    });
    
    /**
    * Should throw BadRequestException if the theater is already full.
    */
    it('it should throw BadRequestException if theater is full', async () => {
        const ticketData : CreateTicketDto = {movie_title: 'Movie title', movie_theater: 'Theater name', movie_start_time: '14:00',
            customer_name: 'Customer name', seat_number: 6};
        
        const showtime = {id: 1, movie_id: 2};
        const movie = {id: 2, title: 'Movie title'};

        mockShowTimeRepository.findShowTimeByTheaterAndStartTime.mockResolvedValue(showtime);
        mockMovieRepository.fetchMovieById.mockResolvedValue(movie);
        mockTicketRepository.isTheaterFull.mockResolvedValue(true);

        await expect(service.addNewTicket(ticketData)).rejects.toThrow(BadRequestException);
    });
    
    /**
    * Should throw BadRequestException if the requested seat is already taken.
    */
    it('it should throw BadRequestException if seat is taken', async () => {
        const ticketData : CreateTicketDto = {movie_title: 'Movie title', movie_theater: 'Theater name', movie_start_time: '14:00',
            customer_name: 'Customer name', seat_number: 6};
        
        const showtime = {id: 1, movie_id: 2};
        const movie = {id: 2, title: 'Movie title'};

        mockShowTimeRepository.findShowTimeByTheaterAndStartTime.mockResolvedValue(showtime);
        mockMovieRepository.fetchMovieById.mockResolvedValue(movie);
        mockTicketRepository.isTheaterFull.mockResolvedValue(false);
        mockTicketRepository.isSeatTaken.mockResolvedValue(true);
        mockTicketRepository.getTicketsForShowTime.mockResolvedValue([]);

        await expect(service.addNewTicket(ticketData)).rejects.toThrow(BadRequestException);
    });
 
    /**
    * Should throw BadRequestException if the same customer already booked the same seat.
    */
    it('should throw BadRequestException if customer + seat already booked', async () => {
        const ticketData : CreateTicketDto = {movie_title: 'Movie title', movie_theater: 'Theater name', movie_start_time: '14:00',
            customer_name: 'Customer name', seat_number: 6};
        
        const showtime = {id: 1, movie_id: 2};
        const movie = {id: 2, title: 'Movie title'};
        const existingTicket = {customer_name: 'Customer name', seat_number: 6};

        mockShowTimeRepository.findShowTimeByTheaterAndStartTime.mockResolvedValue(showtime);
        mockMovieRepository.fetchMovieById.mockResolvedValue(movie);
        mockTicketRepository.isTheaterFull.mockResolvedValue(false);
        mockTicketRepository.isSeatTaken.mockResolvedValue(false);
        mockTicketRepository.getTicketsForShowTime.mockResolvedValue([existingTicket]);

        await expect(service.addNewTicket(ticketData)).rejects.toThrow(BadRequestException);
    });
    
    /**
    * Should throw a generic error if adding a ticket to DB fails unexpectedly.
    */
    it('should throw error if DB add fails', async () => {
        const ticketData : CreateTicketDto = {movie_title: 'Movie title', movie_theater: 'Theater name', movie_start_time: '14:00',
            customer_name: 'Customer name', seat_number: 6};

        const showtime = {id: 1, movie_id: 2};
        const movie = {id: 2, title: 'Movie title'};

        mockShowTimeRepository.findShowTimeByTheaterAndStartTime.mockResolvedValue(showtime);
        mockMovieRepository.fetchMovieById.mockResolvedValue(movie);
        mockTicketRepository.isTheaterFull.mockResolvedValue(false);
        mockTicketRepository.isSeatTaken.mockResolvedValue(false);
        mockTicketRepository.getTicketsForShowTime.mockResolvedValue([]);
        mockTicketRepository.addNewTicket.mockRejectedValue(new Error('DB error'));

        await expect(service.addNewTicket(ticketData)).rejects.toThrow(Error);
    });
    
    /**
    * Should trim and lowercase the customer name before saving the ticket.
    */
    it('should trim and lowercase customer name before adding', async () => {
        const ticketData : CreateTicketDto = {movie_title: '    Movie tITlE   ', movie_theater: '   ThEAter nAMe   ', 
            movie_start_time: '14:00', customer_name: '    CUstOMeR NAme   ', seat_number: 6};
        
        const showtime = {id: 1, movie_id: 2};
        const movie = {id: 2, title: 'movie title'};

        mockShowTimeRepository.findShowTimeByTheaterAndStartTime.mockResolvedValue(showtime);
        mockMovieRepository.fetchMovieById.mockResolvedValue(movie);
        mockTicketRepository.isTheaterFull.mockResolvedValue(false);
        mockTicketRepository.isSeatTaken.mockResolvedValue(false);
        mockTicketRepository.getTicketsForShowTime.mockResolvedValue([]);
        mockTicketRepository.addNewTicket.mockResolvedValue(undefined);

        await service.addNewTicket(ticketData);

        expect(mockTicketRepository.addNewTicket).toHaveBeenCalledWith(
            expect.objectContaining({customer_name: 'customer name'}));
    });
});