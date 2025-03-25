/**
* showTime.repository.ts
* 
* This file defines the ShowTimeRepository class, a custom repository for managing showtime data using raw SQL queries.
* It interacts directly with the database using TypeORM's DataSource, handling insertions, updates, deletions,
* and complex queries like overlapping showtimes or finding exact matches.
*/

import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { DataSource } from "typeorm";
import { ShowTime } from "./showTime.entity";

@Injectable()
export class ShowTimeRepository {
    constructor(private readonly dataSource: DataSource) {}

    /**
    * Inserts a new showtime and returns the created object with its generated ID.
    */
    async addNewShowTime(newShowTime: Omit<ShowTime, 'id'>): Promise<ShowTime> {
        const { movieId, theater, startTime, endTime, price } = newShowTime;

        try {
            const result = await this.dataSource.query(
                `INSERT INTO showtimes (movie_id, theater, "startTime", "endTime", price)
                VALUES ($1, $2, $3, $4, $5)
                 RETURNING *`,
                [movieId, theater, startTime, endTime, price]
            );

            return result[0]; // Return the inserted showtime row
        } catch (error) {
            console.error('DB Error on addNewShowTime:', error);
            throw new InternalServerErrorException('Failed to add showtime to the database.');
        }
    }

    /**
    * Updates an existing showtime by ID.
    * 
    * @param id - Showtime ID.
    * @param showTime - Partial fields to update.
    */
    async updateShowTimeInfo(id: number, showTime: Partial<ShowTime>): Promise<void> {
        const { movieId, theater, startTime, endTime, price } = showTime;
        try {
            await this.dataSource.query(
                `UPDATE showtimes
                 SET movie_id = $1,
                     theater = $2,
                     "startTime" = $3,
                     "endTime" = $4,
                     price = $5
                 WHERE id = $6`,
                [movieId, theater?.trim(), startTime, endTime, price, id]);
        } 
        catch (error) {
            console.error('DB Error on updateShowTimeInfo:', error);
            throw new InternalServerErrorException('Failed to update the showtime information.');
        }
    }

    /**
    * Deletes a showtime by its ID.
    * 
    * @param id - Showtime ID.
    */
    async deleteShowTime(id: number): Promise<void> {
        try {
            await this.dataSource.query(
                `DELETE FROM showtimes WHERE id = $1`,
                [id]);
        } 
        catch (error) {
            console.error('DB Error on deleteShowTime:', error);
            throw new InternalServerErrorException('Failed to delete the showtime.');
        }
    }

    /**
    * Fetches a showtime by its ID.
    * 
    * @param id - Showtime ID.
    * @returns ShowTime object or null.
    */
    async fetchShowTimeById(id: number): Promise<ShowTime | null> {
        try {
          const result = await this.dataSource
            .getRepository(ShowTime)
            .findOne({ where: { id } });
      
          return result;
        } 
        catch (error) {
          console.error('DB Error on fetchShowTimeById:', error);
          throw new InternalServerErrorException('Failed to get the showtime by ID.');
        }
      }

    /**
    * Checks for overlapping showtimes in the same theater.
    * 
    * @param theater - Theater name.
    * @param startTime - Proposed start time.
    * @param endTime - Proposed end time.
    * @returns true if overlap found, false otherwise.
    */
    async hasOverlappingShowTime(
        theater: string,
        startTime: string,
        endTime: string,
        excludeId?: number
      ): Promise<boolean> {
        let query = `
          SELECT 1 FROM showtimes
          WHERE LOWER(theater) = LOWER($1)
          AND (
            ($2 >= "startTime" AND $2 < "endTime") OR
            ($3 > "startTime" AND $3 <= "endTime") OR
            ($2 <= "startTime" AND $3 >= "endTime")
          )
        `;
      
        const params: any[] = [theater, startTime, endTime];
      
        if (excludeId) {
          query += ` AND id != $4`;
          params.push(excludeId);
        }
      
        query += ` LIMIT 1`;
      
        const result = await this.dataSource.query(query, params);
        return result.length > 0;
      }
}