/**
* showTime.repository.ts
* 
* This file defines the ShowTimeRepository class, a custom repository for managing showtime data using raw SQL queries.
* It interacts directly with the database using TypeORM's DataSource, handling insertions, updates, deletions,
* and complex queries like overlapping showtimes or finding exact matches.
* 
* Errors encountered during database operations are caught and rethrown as InternalServerErrorException,
* allowing higher-level services/controllers to handle them appropriately.
*/

import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { DataSource } from "typeorm";
import { ShowTime } from "./showTime.entity";

@Injectable()
export class ShowTimeRepository {
    private readonly dataSource: DataSource;

    constructor(dataSource: DataSource) {
        this.dataSource = dataSource;    
    }

    /**
    * Inserts a new showtime record into the database.
    * 
    * @param newShowTime - A showtime object without an ID.
    * @returns A promise that resolves when the insertion is successful.
    * @throws InternalServerErrorException if the DB operation fails.
    */
    async addNewShowTime(newShowTime: Omit<ShowTime, 'id'>): Promise<void> {
        const {movie_id, theater, start_time, end_time, price} = newShowTime;
        try {
            await this.dataSource.query(
                `INSERT INTO show_time (movie_id, theater, start_time, end_time, price) VALUES ($1, $2, $3, $4, $5)`,
                [movie_id, theater, start_time, end_time, price]);
        }
        catch (error) {
            console.error('DB Error on addNewShowTime:', error);
            throw new InternalServerErrorException('Failed to add showtime to the database.');
        }
    }

    /**
    * Updates an existing showtime by ID.
    * 
    * @param id - ID of the showtime to update.
    * @param showTime - Partial showtime fields to update.
    * @returns A promise that resolves when the update is successful.
    * @throws InternalServerErrorException if the DB operation fails.
    */
    async updateShowTimeInfo(id: number, showTime: Partial<ShowTime>): Promise<void> {
        const {movie_id, theater, start_time, end_time, price} = showTime;
        try {
            await this.dataSource.query(
                `UPDATE show_time
                SET movie_id = $1, theater = $2, start_time = $3, end_time = $4, price = $5
                WHERE id = $6`,
                [movie_id, theater, start_time, end_time, price, id]);
        }
        catch (error) {
            console.error('DB Error on updateShowTimeInfo:', error);
            throw new InternalServerErrorException('Failed to update the showtime information.');
        }
    }

    /**
    * Deletes a showtime by ID.
    * 
    * @param id - The ID of the showtime to delete.
    * @returns A promise that resolves when the deletion is successful.
    * @throws InternalServerErrorException if the DB operation fails.
    */
    async deleteShowTime(id: number): Promise<void> {
        try {
            await this.dataSource.query(
                `DELETE FROM show_time WHERE id = $1`,
                [id]);
        }
        catch (error) {
            console.error('DB Error on deleteShowTime:', error);
            throw new InternalServerErrorException('Failed to delete the showtime.');
        }
    }

    /**
    * Retrieves all showtime records from the database.
    * 
    * @returns A promise resolving to an array of ShowTime objects.
    * @throws InternalServerErrorException if the DB operation fails.
    */
    async fetchAllShowTimes(): Promise<ShowTime[]> {
        try {
            return await this.dataSource.query(`SELECT * FROM show_time`);
        }
        catch (error) {
            console.error('DB Error on fetchAllShowTimes:', error);
            throw new InternalServerErrorException('Failed to get all the showtimes in the database.');
        }
    }

    /**
    * Fetches a single showtime by its ID.
    * 
    * @param id - The showtime ID.
    * @returns The matching ShowTime object or null if not found.
    * @throws InternalServerErrorException if the DB operation fails.
    */
    async fetchShowTimeById(id: number): Promise<ShowTime | null> {
        try {
            const result = await this.dataSource.query(
                `SELECT * FROM show_time WHERE id = $1`,
                [id]);
        
            if (result.length === 0) {
                return null;
            }

            return result[0];
        }
        catch(error) {
            console.error('DB Error on fetchShowTimeById:', error);
            throw new InternalServerErrorException('Failed to get the showtime by his id.');
        }
    }

    /**
    * Checks if there is any overlapping showtime for a given theater and time window.
    * 
    * @param theater - The name of the theater.
    * @param startTime - Proposed start time.
    * @param endTime - Proposed end time.
    * @returns True if overlap exists, false otherwise.
    * @throws InternalServerErrorException if the DB operation fails.
    */
    async hasOverLappingShowTime(theater: string, startTime: string, endTime: string): Promise<boolean> {
        try {
            const result = await this.dataSource.query(
                `SELECT 1 FROM show_time
                WHERE LOWER(theater) = LOWER($1)
                AND (
                    ($2 >= start_time AND $2 < end_time) OR
                    ($3 > start_time AND $3 <= end_time) OR 
                    ($2 <= start_time AND $3 >= end_time)
                )
                LIMIT 1`,
                [theater, startTime, endTime]);
            
            return result.length > 0;
        }
        catch (error) {
            console.error('DB Error on hasOverLappingShowTime:', error);
            throw new InternalServerErrorException('Failed to check for overlapping showtimes.');
        }
    }

    /**
    * Finds a showtime with an exact match of all fields (excluding ID).
    * 
    * @param showtime - A showtime object without an ID.
    * @returns The matching ShowTime or null if none found.
    * @throws InternalServerErrorException if the DB operation fails.
    */
    async findExactShowTime(showtime: Omit<ShowTime, 'id'>): Promise<ShowTime | null> {
        const {movie_id, theater, start_time, end_time, price} = showtime;

        try {
            const result = await this.dataSource.query(
                `SELECT * FROM show_time
                 WHERE movie_id = $1 AND LOWER(theater) = LOWER($2) AND start_time = $3
                    AND end_time = $4 AND price = $5
                LIMIT 1`,
                [movie_id, theater, start_time, end_time, price]);
            
            return result[0] ?? null;
        }
        catch (error) {
            console.error('DB Error on findExactShowTime:', error);
            throw new InternalServerErrorException('Failed to find the exact showtime.');
        }
    }

    /**
    * Finds a showtime by theater name and start time.
    * 
    * @param theater - Name of the theater.
    * @param start_time - Start time of the show.
    * @returns The matching ShowTime object or null if not found.
    * @throws InternalServerErrorException if the DB operation fails.
    */
    async findShowTimeByTheaterAndStartTime(theater: string, start_time: string): Promise<ShowTime | null> {
        try {
            const result = await this.dataSource.query(
                `SELECT * FROM show_time WHERE LOWER(theater) = LOWER($1) AND start_time = $2`,
                [theater.trim(), start_time]);
            
            return result[0] ?? null;
        }
        catch (error) {
            console.error('DB Error on findShowTimeByTheaterAndStartTime:', error);
            throw new InternalServerErrorException('Failed to find the showtime by theater and start time.');
        }
    }
}