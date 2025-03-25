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
        console.log('MovieRepository loaded');
    }

    /**
    * Inserts a new movie into the database.
    * @param newMovie - A movie object without an ID.
    * @throws InternalServerErrorException if the insert query fails.
    */
    async addNewMovie(newMovie: Omit<Movie, 'id'>): Promise<void> {
        const { title, genre, duration, rating, release_year } = newMovie;
        try {
            await this.dataSource.query(
                `INSERT INTO movie (title, genre, duration, rating, release_year) Values ($1, $2, $3, $4, $5)`,
                [title, genre, duration, rating, release_year]);
        }
        catch (error) {
            console.error('DB Error on addNewMovie:', error);
            throw new InternalServerErrorException('Failed to add movie to the database.');
        }
    }

    /**
    * Updates an existing movie record by ID.
    * @param id - Movie ID to update.
    * @param movie - Partial movie object containing updated fields.
    * @throws InternalServerErrorException if the update query fails.
    */
    async updateMovieInfo(id: number, movie: Partial<Movie>): Promise<void> {
        const { title, genre, duration, rating, release_year } = movie;
        try {    
            await this.dataSource.query(
                `UPDATE movie
                SET title = $1, genre = $2, duration = $3, rating = $4, release_year = $5
                WHERE id = $6`,
                [title, genre, duration, rating, release_year, id]);
        }
        catch (error) {
            console.error('DB Error on updateMovieInfo:', error);
            throw new InternalServerErrorException('Failed to update the movie information.');
            }
    }

    /**
    * Deletes a movie by its ID.
    * @param id - The ID of the movie to delete.
    * @throws InternalServerErrorException if the delete query fails.
    */
    async deleteMovie(id: number): Promise<void> {
        try {
            await this.dataSource.query(
                `DELETE FROM movie WHERE id = $1`,
                [id]);
        }
        catch (error) {
            console.error('DB Error on deleteMovie:', error);
            throw new InternalServerErrorException('Failed to delete the movie.');
        }
    }

    /**
    * Fetches all movies from the database.
    * @returns An array of Movie objects.
    * @throws InternalServerErrorException if the query fails.
    */
    async fetchAllMovies(): Promise<Movie[]> {
        try {
            return await this.dataSource.query(`SELECT * FROM movie`);
        }
        catch (error) {
            console.error('DB Error on fetchAllMovies:', error);
            throw new InternalServerErrorException('Failed to get all the movies in the database.');
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
                `SELECT * FROM movie WHERE id = $1`,
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

    /**
    * Fetches a movie by its title and release year.
    * @param title - The movie's title (assumed to be already trimmed and lowercased).
    * @param release_year - The movie's release year.
    * @returns The matching movie or null if not found.
    * @throws InternalServerErrorException if the query fails.
    */
    async fetchMovieByTitleAndReleaseYear(title: string, release_year: number): Promise<Movie | null> {
        try {
            const result = await this.dataSource.query(
                `SELECT * FROM movie WHERE title = $1 AND release_year = $2`,
                [title, release_year]);
        
            if (result.length === 0) {
                return null;
            }

            return result[0];
        }
        catch(error) {
            console.error('DB Error on fetchMovieByTitleAndReleaseYear:', error);
            throw new InternalServerErrorException('Failed to get the movie by title and release year.');
        }
    }
}