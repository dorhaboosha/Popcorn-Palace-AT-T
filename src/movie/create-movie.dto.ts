/**
* create-movie.dto.ts
*
* This file defines the data transfer object (DTO) used when creating a new movie.
* It enforces validation rules on the incoming request body to ensure only valid and complete movie data is accepted.
*/

import { IsString, IsInt, IsNumber, Min, Max, IsNotEmpty } from 'class-validator';

export class CreateMovieDto {

    /**
    * The title of the movie.
    * - Must be a non-empty string.
    */
    @IsString({ message: "Movie's title must be string." })
    @IsNotEmpty({ message: "Movie's title is a required field." })
    title: string;

    /**
    * The genre of the movie.
    * - Must be a non-empty string.
    */
    @IsString({ message: "Movie's genre must be string."})
    @IsNotEmpty({ message: "Movie's genre is a required field." })
    genre: string;

    /**
    * The duration of the movie in minutes.
    * - Must be an integer that is at least 1.
    */
    @IsInt({ message: "Movie's duration must contain the movie duration in minutes."})
    @IsNotEmpty({ message: "Movie's duration is a required field." })
    @Min(1, { message: "Movie's duration must be at least 1 minute."})
    duration: number;

    /**
    * The rating of the movie.
    * - Must be a number between 0 and 10.
    */
    @IsNumber({}, {message: "Movie's rating must contain a number between 0 and 10."})
    @IsNotEmpty({ message: "Movie's rating is a required field." })
    @Min(0, { message: "Movie's rating must be at least 0." })
    @Max(10, { message: "Movie's rating must be at most 10." })
    rating: number;

    /**
    * The release year of the movie.
    * - Must be an integer at least 1888.
    */
    @IsInt({ message: "Movie's release year must be a valid year."})
    @IsNotEmpty({ message: "Movie's release year is a required field." })
    @Min(1888, { message: "Movie's release year must be 1888 or later." })
    release_year: number;
}