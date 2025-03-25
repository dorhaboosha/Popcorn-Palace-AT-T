/**
* ticket.controller.ts
* 
* This controller handles HTTP requests related to ticket operations.
* 
* Currently, it exposes a single POST endpoint to create a new ticket
* for a specific movie showtime. It delegates business logic and validation
* to the `TicketService`.
* 
* Route: POST /ticket/AddNewTicket
* 
* Used in combination with `CreateTicketDto` for request validation.
*/

import { Controller, Post, Body, BadRequestException } from "@nestjs/common";
import { TicketService } from "./ticket.service";
import { CreateTicketDto } from "./create-ticket.dto";

@Controller('ticket')
export class TicketController {
    private readonly ticketService: TicketService;

    constructor(ticketService: TicketService) {
        this.ticketService = ticketService;
    }

    /**
    * POST /ticket/AddNewTicket
    * 
    * Creates a new ticket for a specific movie showtime.
    * 
    * @param newTicket - Ticket details provided in the request body (validated by CreateTicketDto)
    * @returns A success message on successful booking
    * @throws BadRequestException if validation fails or the service throws a BadRequestException
    * @throws NotFoundException if movie or showtime is not found
    * @throws InternalServerErrorException for any unexpected server-side issues
    */
    @Post('AddNewTicket')
    async addNewTicket(@Body() newTicket: CreateTicketDto): Promise<{message: string}> {
        await this.ticketService.addNewTicket(newTicket);
        return { message: 'Ticket successfully added.' };
    }
}