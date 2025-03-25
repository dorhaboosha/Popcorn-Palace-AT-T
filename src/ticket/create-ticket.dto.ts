/**
* create-ticket.dto.ts
* 
* This Data Transfer Object (DTO) defines the structure and validation rules
* for creating a new movie ticket in the system.
* 
* It includes required fields for identifying the movie, theater, and showtime,
* as well as customer name and seat number. Validation decorators ensure all data
* is present and formatted correctly before proceeding with ticket creation.
* 
* This DTO is used in the `addNewTicket()` method in the TicketService and
* in the TicketController to handle client POST requests.
*/

import { IsString, IsMilitaryTime, IsInt, Min, Max, IsNotEmpty, Matches } from "class-validator";

export class CreateTicketDto {

    /**
    * Title of the movie for which the ticket is being booked.
    * Must be a non-empty string.
    */
    @IsString({message: "Ticket's movie title must be string."})
    @IsNotEmpty({ message: "Ticket's movie title is a required field." })
    movie_title: string;

    /**
    * Name of the theater where the movie is showing.
    * Must be a non-empty string.
    */
    @IsString({message: "Ticket's movie theater must be string."})
    @IsNotEmpty({ message: "Ticket's movie theater is a required field." })
    movie_theater: string;

    /**
    * Start time of the movie in HH:mm format (military time).
    * Must be a non-empty valid time string.
    */
    @IsMilitaryTime({ message: "Ticket's movie start time must be in HH:mm format." })
    @IsNotEmpty({ message: "Ticket's movie start time is a required field." })
    movie_start_time: string;

    /**
    * Full name of the customer purchasing the ticket.
    * Must only contain letters and spaces, and cannot be empty.
    */
    @Matches(/^[A-Za-z\s]+$/, { message: "Customer name must only contain letters and spaces." })
    @IsNotEmpty({ message: "Ticket's movie customer name is a required field." })
    customer_name: string;

    /**
    * Seat number the customer wants to book.
    * Must be an integer between 1 and 100 (inclusive).
    */
    @IsInt({ message: "Ticket's movie seat number must be a valid number." })
    @IsNotEmpty({ message: "Ticket's movie seat number is a required field." })
    @Min(1, { message: "Ticket's movie seat number must be at least 1." })
    @Max(100, { message: "Ticket's movie seat number must be at most 100." })
    seat_number: number;
}
