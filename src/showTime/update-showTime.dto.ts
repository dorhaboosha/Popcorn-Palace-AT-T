/** 
* update-showTime.dto.ts
* 
* This Data Transfer Object (DTO) defines the structure and validation rules
* for updating a movie showtime.
* 
* All fields are optional to support partial updates, and validation decorators
* are used to ensure that any provided fields meet the expected format and constraints.
* 
* This DTO is used in the `updateShowTimeInfo()` method of the ShowTimeService and
* in the `UpdateShowTime` controller endpoint.
*/

import { IsString, IsInt, Min, IsMilitaryTime, IsNumber, IsOptional } from 'class-validator';

export class UpdateShowTimeDto {

    /**
    * (Optional) Updated name of the theater.
    * Must be a string if provided.
    */
    @IsOptional()
    @IsString({ message: "Showtime's theater must be a string." })
    theater?: string;

    /**
    * (Optional) Updated start time for the show.
    * Must be a valid military time format (HH:mm).
    */
    @IsOptional()
    @IsMilitaryTime({ message: "Showtime's start time must be in HH:mm format." })
    start_time?: string;

    /**
    * (Optional) Updated end time for the show.
    * Must be a valid military time format (HH:mm).
    */
    @IsOptional()
    @IsMilitaryTime({ message: "Showtime's end time must be in HH:mm format." })
    end_time?: string;

    /**
    * (Optional) Updated price for the show.
    * Must be a number greater than or equal to 0.
    */
    @IsOptional()
    @IsNumber({}, { message: "Showtime's price must be a number." })
    @Min(0, { message: "Showtime's price must be at least 0." })
    price?: number;

    /**
    * (Optional) Updated movie title.
    * Used to change the associated movie.
    * Must be a string if provided.
    */
    @IsOptional()
    @IsString({ message: "Movie title must be a string." })
    movie_title?: string;

    /**
    * (Optional) Updated movie release year.
    * Used in combination with `movie_title` to change the associated movie.
    * Must be an integer >= 1888 if provided.
    */
    @IsOptional()
    @IsInt({ message: "Movie release year must be a valid year." })
    @Min(1888, { message: "Movie's release year must be 1888 or later." })
    movie_release_year?: number;
}