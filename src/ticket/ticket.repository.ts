/**
* ticket.repository.ts
* 
* This repository provides custom SQL-based access to the `ticket` table in the database.
* 
* It includes methods to:
* - Add a new ticket
* - Check if a specific seat is already taken
* - Check if the theater is fully booked (100 seats max)
* - Retrieve all tickets for a specific showtime
* 
* All methods use raw SQL queries via TypeORM's `DataSource.query()` method,
* and handle errors by throwing `InternalServerErrorException`.
*/

import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { DataSource } from "typeorm";
import { Ticket } from "./ticket.entity";

@Injectable()
export class TicketRepository {
    private readonly dataSource: DataSource;

    constructor(dataSource: DataSource) {
        this.dataSource = dataSource;    
    }

    /**
    * Inserts a new ticket into the database.
    * 
    * @param ticket - A complete `Ticket` object (movie_id, showtime_id, seat_number, customer_name)
    * @throws InternalServerErrorException if the insert fails
    */
    async addNewTicket(ticket: Ticket): Promise<void> {
        try {
            await this.dataSource.query(
                `INSERT INTO ticket (movie_id, showtime_id, seat_number, customer_name) VALUES ($1, $2, $3, $4)`,
                    [ticket.movie_id, ticket.showtime_id, ticket.seat_number, ticket.customer_name]);
        }
        catch (error) {
            console.error('DB Error on addNewTicket:', error);
            throw new InternalServerErrorException('Failed to add ticket to the database.');
        }
    }

    /**
    * Checks if a specific seat is already taken for the given showtime.
    * 
    * @param showtimeId - The ID of the showtime
    * @param seat_number - The seat number to check
    * @returns true if the seat is taken, false otherwise
    * @throws InternalServerErrorException if the query fails
    */
    async isSeatTaken(showtimeId: number, seat_number: number): Promise<boolean> {
        try {
            const result = await this.dataSource.query(`SELECT 1 FROM ticket WHERE showtime_id = $1 AND seat_number = $2`,
                [showtimeId, seat_number]);
            
            return result.length > 0;
        }
        catch (error) {
            console.error('DB Error on isSeatTaken:', error);
            throw new InternalServerErrorException('Failed to check if the seat is taken.');
        }
    }

    /**
    * Checks if the theater for the given showtime is full (i.e., 100 tickets sold).
    * 
    * @param showtimeId - The ID of the showtime
    * @returns true if 100 tickets exist for the showtime, false otherwise
    * @throws InternalServerErrorException if the query fails
    */
    async isTheaterFull(showtimeId: number): Promise<boolean> {
        try {
            const result = await this.dataSource.query(`SELECT COUNT(*)::int AS count FROM ticket WHERE showtime_id = $1`,
                [showtimeId]);
            
            return result[0]?.count == 100;
        }
        catch (error) {
            console.error('DB Error on isTheaterFull:', error);
            throw new InternalServerErrorException('Failed to check if the theater is full.');
        }
    }

    /**
    * Retrieves all tickets associated with a specific showtime.
    * 
    * @param showtimeId - The ID of the showtime
    * @returns An array of Ticket entities
    * @throws InternalServerErrorException if the query fails
    */
    async getTicketsForShowTime(showtimeId: number): Promise<Ticket[]> {
        try {
            return await this.dataSource.query(`SELECT * FROM ticket WHERE showtime_id = $1`,[showtimeId]);
        }
        catch (error) {
            console.error('DB Error on getTicketsForShowTime:', error);
            throw new InternalServerErrorException('Failed to fetch tickets for the showtime.');
        }
    }
}