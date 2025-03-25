/**
* update-movie.dto.ts
* 
* This file defines the Data Transfer Object (DTO) for updating a movie entity.
* It is used to validate and transfer data when updating movie details via API requests.
* 
* All fields are optional to allow partial updates.
* Validation decorators from `class-validator` ensure proper data types and value constraints.
*/
import { IsString, IsInt, IsNumber, Min, Max, IsOptional } from 'class-validator';

export class UpdateMovieDto {
  
  /**
  * (Optional) The new title of the movie.
  * Must be a string if provided.
  */
  @IsOptional()
  @IsString({ message: "Movie's title must be a string." })
  title?: string;

  /**
  * (Optional) The new genre of the movie.
  * Must be a string if provided.
  */
  @IsOptional()
  @IsString({ message: "Movie's genre must be a string." })
  genre?: string;

  /**
  * (Optional) The new duration of the movie in minutes.
  * Must be a positive integer (minimum 1) if provided.
  */
  @IsOptional()
  @IsInt({ message: "Movie's duration must contain the movie duration in minutes."})
  @Min(1, { message: "Movie's duration must be at least 1 minute."})
  duration?: number;

  /**
  * (Optional) The new rating of the movie.
  * Must be a number between 0 and 10 if provided.
  */
  @IsOptional()
  @IsNumber({}, { message: "Movie's rating must be a number." })
  @Min(0, { message: "Movie's rating must be at least 0." })
  @Max(10, { message: "Movie's rating must be at most 10." })
  rating?: number;

  /**
  * (Optional) The new release year of the movie.
  * Must be an integer from 1888 onward if provided.
  */
  @IsOptional()
  @IsInt({ message: "Movie's release year must be a valid year." })
  @Min(1888, { message: "Movie's release year must be 1888 or later." })
  release_year?: number;
}
