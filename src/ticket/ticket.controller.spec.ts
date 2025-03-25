/**
* ticket.controller.spec.ts
* 
* This file contains unit tests for the `TicketController` in a NestJS application.
* It tests the `addNewTicket` endpoint to ensure correct interaction with the TicketService
* and proper error handling.
* 
* The tests use mocked `TicketService` and a global `ValidationPipe` to simulate
* controller behavior, verify successful ticket creation, and ensure appropriate
* exceptions are thrown for various failure scenarios.
*/

import { Test, TestingModule } from "@nestjs/testing";
import { TicketController } from "./ticket.controller";
import { TicketService } from "./ticket.service";
import { CreateTicketDto } from "./create-ticket.dto";
import { BadRequestException, NotFoundException, InternalServerErrorException, ValidationPipe } from "@nestjs/common";
import { APP_PIPE } from "@nestjs/core";

describe('TicketController', () => {
    let controller: TicketController;
    let mockTicketService: Partial<Record<keyof TicketService, jest.Mock>>;

    beforeEach(async () => {
        mockTicketService = {addNewTicket: jest.fn()};

        const module : TestingModule = await Test.createTestingModule(
            {controllers: [TicketController], providers: [{provide: TicketService, useValue: mockTicketService},
                {provide: APP_PIPE  , useValue: new ValidationPipe({whitelist: true, forbidNonWhitelisted: true, transform: true})}]}
        ).compile();

        controller = module.get<TicketController>(TicketController);
    });

    /**
    * Should return success message when ticket is added successfully.
    */
    it('should add a ticket successfully', async () => {
        const ticketData: CreateTicketDto = {movie_title: 'movie title', movie_theater: 'theater name', movie_start_time: '14:00',
            customer_name: 'customer name', seat_number: 5};

        mockTicketService.addNewTicket!.mockResolvedValue(undefined);

        const result = await controller.addNewTicket(ticketData);

        expect(mockTicketService.addNewTicket).
        toHaveBeenCalledWith(ticketData);
        expect(result).toEqual({message: 'Ticket successfully added.'});
    });

    /**
    * Should throw BadRequestException if seat is already taken.
    */
    it('should throw BadRequestException if seat is already taken', async () => {
        const ticketData: CreateTicketDto = {movie_title: 'movie title', movie_theater: 'theater name', movie_start_time: '14:00',
            customer_name: 'customer name', seat_number: 5};
        
        mockTicketService.addNewTicket!.mockRejectedValue(new BadRequestException('Seat already taken'));
        
        await expect(controller.addNewTicket(ticketData)).rejects.toThrow(BadRequestException);
    });

    /**
    * Should throw BadRequestException if theater is full.
    */
    it('should throw BadRequestException if theater is full', async () => {
        const ticketData: CreateTicketDto = {movie_title: 'movie title', movie_theater: 'theater name', movie_start_time: '14:00',
            customer_name: 'customer name', seat_number: 5};
        
        mockTicketService.addNewTicket!.mockRejectedValue(new BadRequestException('Theater is full'));
        
        await expect(controller.addNewTicket(ticketData)).rejects.toThrow(BadRequestException);
    });

    /**
    * Should throw BadRequestException if customer already booked the same seat.
    */
    it('should throw BadRequestException if same customer already booked the seat', async () => {
        const ticketData: CreateTicketDto = {movie_title: 'movie title', movie_theater: 'theater name', movie_start_time: '14:00',
            customer_name: 'customer name', seat_number: 5};
        
        mockTicketService.addNewTicket!.mockRejectedValue(new BadRequestException('Customer already booked the seat'));

        await expect(controller.addNewTicket(ticketData)).rejects.toThrow(BadRequestException);
    });

    /**
    * Should throw NotFoundException if showtime is not found.
    */
    it('should throw NotFoundException if showtime not found', async () => {
        const ticketData: CreateTicketDto = {movie_title: 'movie title', movie_theater: 'theater name', movie_start_time: '14:00',
            customer_name: 'customer name', seat_number: 5};
        
        mockTicketService.addNewTicket!.mockRejectedValue(new NotFoundException('Showtime not found'));
        
        await expect(controller.addNewTicket(ticketData)).rejects.toThrow(NotFoundException);
    });

    /**
    * Should throw NotFoundException if the movie does not exist.
    */
    it('should throw NotFoundException if movie not found', async () => {
        const ticketData: CreateTicketDto = {movie_title: 'movie title', movie_theater: 'theater name', movie_start_time: '14:00',
            customer_name: 'customer name', seat_number: 5};

        mockTicketService.addNewTicket!.mockRejectedValue(new NotFoundException('Movie not found'));
        
        await expect(controller.addNewTicket(ticketData)).rejects.toThrow(NotFoundException);
    });

    /**
    * Should throw BadRequestException if movie title does not match the scheduled movie.
    */
    it('should throw BadRequestException if movie name not mathced scheduled one', async () => {
        const ticketData: CreateTicketDto = {movie_title: 'movie title', movie_theater: 'theater name', movie_start_time: '14:00',
            customer_name: 'customer name', seat_number: 5};

        mockTicketService.addNewTicket!.mockRejectedValue(new BadRequestException('Movie name not matched scheduled one'));

        await expect(controller.addNewTicket(ticketData)).rejects.toThrow(BadRequestException);
    });

    /**
    * Should throw a generic error if an unexpected exception is thrown.
    */
    it('should throw a generic error on unexpected failure', async () => {
        const ticketData: CreateTicketDto = {movie_title: 'movie title', movie_theater: 'theater name', movie_start_time: '14:00',
            customer_name: 'customer name', seat_number: 5};

        mockTicketService.addNewTicket!.mockRejectedValue(new Error('Something unexpected'));
    
        await expect(controller.addNewTicket(ticketData)).rejects.toThrow(Error);
      });
});