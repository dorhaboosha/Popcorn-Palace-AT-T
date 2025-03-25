/**
 * ticket.service.ts
 * 
 * This service handles the business logic for ticket creation in the movie ticket booking system.
 * It verifies the correctness of the data, ensures that tickets are only added when the seat is available,
 * the movie matches the showtime, and the theater has not reached capacity.
 * 
 * Responsibilities:
 * - Verifies that the showtime exists for the given theater and time.
 * - Confirms that the correct movie is scheduled for that showtime.
 * - Checks that the theater is not full and the requested seat is not taken.
 * - Ensures the same customer hasn't already booked the same seat.
 * - Inserts the new ticket into the database.
 */

import { Injectable, BadRequestException, NotFoundException, Inject } from "@nestjs/common";
import { TicketRepository } from "./ticket.repository";
import { ShowTimeRepository } from "src/showTime/showTime.repository";
import { MovieRepository } from "src/movie/movie.repository";
import { CreateTicketDto } from "./create-ticket.dto";
import { Ticket } from "./ticket.entity";

@Injectable()
export class TicketService {
    constructor(
        private readonly ticketRepository: TicketRepository,
        @Inject('ShowTimeRepository') private readonly ShowTimeRepository: ShowTimeRepository,
        @Inject('MovieRepository') private readonly MovieRepository: MovieRepository) {}

    /**
    * Creates and stores a new movie ticket after validating all business constraints.
    * 
    * @param ticketData - Data required to book a ticket (movie title, theater, start time, customer name, seat number)
    * 
    * @throws NotFoundException
    * - If no matching showtime is found for the theater and start time
    * - If the movie for the showtime doesn't exist
    * 
    * @throws BadRequestException
    * - If the movie name doesn't match the scheduled movie
    * - If the theater is full (100 seats already taken)
    * - If the same customer has already booked the same seat
    * - If the seat number is already taken by someone else
    * 
    * @returns void (inserts a new ticket to the database)
    */
    async addNewTicket(ticketData: CreateTicketDto): Promise<void> {
        const {movie_title, movie_theater, movie_start_time, customer_name, seat_number} = ticketData;

        // Normalize input
        const movieName = movie_title.trim().toLowerCase();
        const theaterName = movie_theater.trim().toLowerCase();
        const customerName = customer_name.trim().toLowerCase();

        // Fetch showtime
        const showTime = await this.ShowTimeRepository.findShowTimeByTheaterAndStartTime(theaterName, movie_start_time);
        if (!showTime) {
            throw new NotFoundException(`No showtime found in ${theaterName} at ${movie_start_time}`);
        }

        // Fetch associated movie
        const movie = await this.MovieRepository.fetchMovieById(showTime.movie_id);
        if (!movie) {
            throw new NotFoundException(`Movie with ID ${showTime.movie_id} (referenced by showtime) not found`);
        }

        // Validate movie title
        if (movie.title.trim().toLowerCase() !== movieName) {
            throw new BadRequestException(`The movie scheduled for this showtime is '${movie.title}', not '${movie_title}'.`);
        }

        // Check if theater is full
        const isFull = await this.ticketRepository.isTheaterFull(showTime.id);
        if (isFull) {
            throw new BadRequestException(`The theater is full. No more seats available for this showtime`);
        }

        // Prevent duplicate customer-seat booking
        const allTickets = await this.ticketRepository.getTicketsForShowTime(showTime.id) || [];
        const duplicate = allTickets.find(ticket => ticket.customer_name.toLowerCase() === customerName &&
                                                         ticket.seat_number === seat_number);
        if (duplicate) {
            throw new BadRequestException(`Customer- ${customer_name} already has a ticket for seat number ${seat_number} for this showtime`);
        }

        // Check if seat is taken
        const isSeatTaken = await this.ticketRepository.isSeatTaken(showTime.id, seat_number);
        if (isSeatTaken) {
            throw new BadRequestException(`Seat number: ${seat_number}, is already taken for this showtime`);
        }

        // Create and insert new ticket
        const newTicket: Ticket = {movie_id: movie.id, showtime_id: showTime.id, seat_number, customer_name: customerName} as Ticket;

        await this.ticketRepository.addNewTicket(newTicket);
    }
}