/**
* ticket.module.ts
* 
* This module is responsible for managing the ticket-related feature of the application.
* It wires together the controller, service, repository, and entity related to movie ticket booking.
* 
* It imports dependencies from:
* - TypeORM for database access to the Ticket entity
* - ShowTimeModule to validate showtime-related logic
* - MovieModule to validate movie-related logic
* 
* This module:
* - Registers 'TicketController' to handle HTTP requests
* - Provides 'TicketService' and 'TicketRepository' for business and data logic
* - Exports 'TicketService' for use in other modules
*/
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TicketController } from "./ticket.controller";
import { TicketService } from "./ticket.service";
import { TicketRepository } from "./ticket.repository";
import { Ticket } from "./ticket.entity";
import { ShowTimeModule } from "src/showTime/showTime.module";
import { MovieModule } from "src/movie/movie.module";

@Module({
    imports: [TypeOrmModule.forFeature([Ticket]), ShowTimeModule, MovieModule],
    controllers: [TicketController],
    providers: [TicketService, TicketRepository],
    exports: [TicketService]
})
export class TicketModule {
    constructor() {
        console.log('TicketModule loaded');
    }
}