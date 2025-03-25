/**
* create-showTime.dto.ts
* 
* This file defines the Data Transfer Object (DTO) for creating a new showtime entry.
* It ensures that all required fields are present and correctly formatted before being processed by the service layer.
* 
* The DTO includes validations for required fields, time format, and value constraints using class-validator decorators.
*/

import { IsString, IsMilitaryTime, IsNumber, Min, IsInt, IsNotEmpty } from "class-validator";

export class CreateShowTimeDto {
    
    /**
    * The title of the movie for which the showtime is scheduled.
    * Must be a non-empty string.
    */
    @IsString({message: "Movie's title must be string."})
    @IsNotEmpty({ message: "Movie's title is a required field." })
    movie_title: string;

    /**
    * The release year of the movie.
    * Must be a non-empty integer and not earlier than 1888.
    */
    @IsInt({ message: "Movie's release year must be a valid year." })
    @IsNotEmpty({ message: "Movie's release year is a required field." })
    @Min(1888, { message: "Movie's release year must be 1888 or later." })
    movie_release_year: number;

    /**
    * The name of the theater where the showtime will take place.
    * Must be a non-empty string.
    */
    @IsString({ message: "Showtime's theater must be a string." })
    @IsNotEmpty({ message: "Showtime's theater is a required field." })
    theater: string;

    /**
    * The start time of the showtime in HH:mm format (24-hour military time).
    * Must be a non-empty string in valid time format.
    */
    @IsMilitaryTime({ message: "Showtime's start time must be in HH:mm format." })
    @IsNotEmpty({ message: "Showtime's start time is a required field." })
    start_time: string;

    /**
    * The end time of the showtime in HH:mm format (24-hour military time).
    * Must be a non-empty string in valid time format.
    */
    @IsMilitaryTime({ message: "Showtime's end time must be in HH:mm format." })
    @IsNotEmpty({ message: "Showtime's end time is a required field." })
    end_time: string;

    /**
    * The ticket price for the showtime.
    * Must be a non-empty number and greater than or equal to 0.
    */
    @IsNumber({}, { message: "Showtime's price must be a number." })
    @IsNotEmpty({ message: "Showtime's price is a required field." })
    @Min(0, { message: "Showtime's price must be at least 0." })
    price: number;
}