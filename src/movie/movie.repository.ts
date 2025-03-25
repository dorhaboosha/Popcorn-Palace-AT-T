/**
* movie.repository.ts
* 
* This file defines the MovieRepository class, responsible for executing raw SQL queries 
* related to the Movie entity. It handles all database-level operations such as inserting,
* updating, deleting, and retrieving movie records using TypeORM's DataSource.
*/

import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { DataSource } from "typeorm";
import { Movie } from "./movie.entity";

@Injectable()
export class MovieRepository {
    private readonly dataSource: DataSource;

    constructor(dataSource: DataSource) {
        this.dataSource = dataSource;
    }

    /**
    * Retrieves all movies from the database.
    * @returns Promise<Movie[]>
    */
    async getAllMovies(): Promise<Movie[]> {
        try {
            return await this.dataSource.query('SELECT * FROM movies');
        } 
        catch (error) {
            console.error('Error fetching all movies:', error);
            throw new InternalServerErrorException('Error fetching all movies', error);
        }
    }

    /**
    * Finds a movie by its title (case-insensitive).
    * @param title - Movie title to search for
    * @returns Promise<Movie | null>
    */
    async findMovieByTitle(title: string): Promise<Movie | null> {
        try {
            const result = await this.dataSource.query( 'SELECT * FROM movies WHERE LOWER(title) = LOWER($1)', [title.trim()]);
            
            return result.length > 0 ? result[0] : null;
        } 
        catch (error) {
            console.error('Error fetching movie by title:', error);
            throw new InternalServerErrorException('Error fetching movie by title', error);
        }
    }

    /**
    * Creates a new movie in the database.
    * @param newMovie - Movie object to insert
    */
    async addNewMovie(newMovie: Omit<Movie, 'id'>): Promise<void> {
        const { title, genre, duration, rating, releaseYear } = newMovie;
        try {
            await this.dataSource.query( `INSERT INTO movies (title, genre, duration, rating, release_year) 
                                            VALUES ($1, $2, $3, $4, $5)`,
                                            [title.trim(), genre.trim(), duration, rating, releaseYear]);
        } 
        catch (error) {
            console.error('Error adding new movie:', error);
            throw new InternalServerErrorException('Failed to add movie to the database.', error);
        }
    }

    /**
    * Updates a movie's information using its title.
    * @param movieTitle - Existing movie title to search by
    * @param movie - Fields to update
    */
    async updateMovieInfo(movieTitle: string, movie: Partial<Movie>): Promise<void> {
        const { title, genre, duration, rating, releaseYear } = movie;
        try {
            await this.dataSource.query(
                `UPDATE movies 
                SET
                title = COALESCE($1, title), genre = COALESCE($2, genre), duration = COALESCE($3, duration),
                rating = COALESCE($4, rating), release_year = COALESCE($5, release_year)
                WHERE LOWER(title) = LOWER($6)`,
                [title?.trim() ?? null, genre?.trim() ?? null, duration ?? null,
                     rating ?? null, releaseYear ?? null, movieTitle.trim()]);
        } 
        catch (error) {
            console.error('Error updating movie:', error);
            throw new InternalServerErrorException('Failed to update the movie information.', error);
        }
    }

    /**
    * Deletes a movie by its title.
    * @param title - The title of the movie to delete.
    */
    async deleteMovie(title: string): Promise<void> {
        try {
            await this.dataSource.query(`DELETE FROM movies WHERE LOWER(title) = LOWER($1)`, [title.trim()]);
        } 
        catch (error) {
            console.error('Error deleting movie:', error);
            throw new InternalServerErrorException('Failed to delete the movie.', error);
        }
    }

        /**
    * Fetches a movie by its ID.
    * @param id - The ID of the movie.
    * @returns The movie object or null if not found.
    * @throws InternalServerErrorException if the query fails.
    */
        async fetchMovieById(id: number): Promise<Movie | null> {
            try {
                const result = await this.dataSource.query(
                    `SELECT * FROM movies WHERE id = $1`,
                    [id]);
            
                if (result.length === 0) {
                    return null;
                }
    
                return result[0];
            }
            catch(error) {
                console.error('DB Error on fetchMovieById:', error);
                throw new InternalServerErrorException('Failed to get the movie by his id.');
            }
    }
}