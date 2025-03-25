/**
 * showTime.controller.ts
 *
 * This controller handles all HTTP endpoints related to movie showtimes.
 * It delegates business logic to the ShowTimeService and exposes endpoints for:
 *  - Creating a new showtime
 *  - Fetching a showtime by ID
 *  - Updating a showtime
 *  - Deleting a showtime
 * 
 * Routes match the following spec:
 * - POST    /showtimes
 * - GET     /showtimes/:id
 * - POST    /showtimes/update/:id
 * - DELETE  /showtimes/:id
 */

import { Body, Controller, Get, Post, Delete, Param, ParseIntPipe } from "@nestjs/common";
import { ShowTimeService } from "./showTime.service";
import { ShowTimeDto } from "./showTime.dto";
import { ShowTime } from "./showTime.entity";

@Controller('showtimes')
export class ShowTimeController {
    private readonly showTimeService: ShowTimeService;

    constructor(showTimeService: ShowTimeService) {
        this.showTimeService = showTimeService;
    }

    /**
     * Handles POST /showtimes
     * 
     * Creates a new showtime and returns the created showtime object.
     * 
     * @param dto - ShowTimeDto containing movieId, price, theater, startTime, endTime
     * @returns The created showtime.
     * @throws BadRequestException if validation fails.
     * @throws NotFoundException if the movie does not exist.
     */
    @Post()
    async addNewShowTime(@Body() dto: ShowTimeDto): Promise<ShowTime> {
        return this.showTimeService.addNewShowTime(dto);
    }

    /**
     * Handles GET /showtimes/:id
     * 
     * Fetches a showtime by its ID.
     * 
     * @param id - ID of the showtime
     * @returns The showtime object
     * @throws BadRequestException if ID is invalid
     * @throws NotFoundException if showtime does not exist
     */
    @Get(':id')
    async fetchShowTimeById(@Param('id', ParseIntPipe) id: number): Promise<ShowTime> {
        return this.showTimeService.fetchShowTimeById(id);
    }

    /**
     * Handles POST /showtimes/update/:id
     * 
     * Updates an existing showtime by ID.
     * 
     * @param id - ID of the showtime
     * @param dto - Updated showtime fields (same DTO used for creation)
     * @returns A message confirming the update
     * @throws BadRequestException or NotFoundException if validation fails
     */
    @Post('update/:id')
    async updateShowTimeInfo(@Param('id', ParseIntPipe) id: number, @Body() dto: ShowTimeDto): Promise<{ message: string }> {
        await this.showTimeService.updateShowTimeInfo(id, dto);
        return { message: `Showtime with ID ${id} successfully updated.` };
    }

    /**
     * Handles DELETE /showtimes/:id
     * 
     * Deletes a showtime by ID.
     * 
     * @param id - Showtime ID
     * @returns A message confirming deletion
     * @throws BadRequestException if ID is invalid
     * @throws NotFoundException if showtime does not exist
     */
    @Delete(':id')
    async deleteShowTime(@Param('id', ParseIntPipe) id: number): Promise<{ message: string }> {
        await this.showTimeService.deleteShowTime(id);
        return { message: `Showtime with ID ${id} successfully deleted.` };
    }
}
