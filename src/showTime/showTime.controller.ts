/**
* showTime.controller.ts
* 
* This controller handles all HTTP endpoints related to movie showtimes.
* It delegates the business logic to the ShowTimeService and exposes endpoints for:
*  - Creating a new showtime
*  - Fetching a showtime by ID
*  - Updating a showtime
*  - Deleting a showtime
* 
* Validates input parameters and request bodies using NestJS pipes and DTOs.
*/
import { Body, Controller, Get, Post, Delete, Param, ParseIntPipe, Patch } from "@nestjs/common";
import { ShowTimeService } from "./showTime.service";
import { CreateShowTimeDto } from "./create-showTime.dto";
import { UpdateShowTimeDto } from "./update-showTime.dto";

@Controller('showTime')
export class ShowTimeController {
    private readonly showTimeService: ShowTimeService;

    constructor(showTimeService: ShowTimeService) {
        this.showTimeService = showTimeService;
    }

    /**
    * Creates a new showtime.
    * 
    * @param createShowTimeDto - DTO containing showtime details (movie, theater, times, price)
    * @returns A success message if the showtime is added successfully.
    * @throws BadRequestException if input is invalid or duplicate.
    * @throws NotFoundException if the referenced movie is not found.
    */
    @Post('AddNewShowTime')
    async addNewShowTime(@Body() createShowTimeDto: CreateShowTimeDto): Promise<{message: string}> {
        await this.showTimeService.addNewShowTime(createShowTimeDto);
        return { message: 'Showtime successfully added.' };
    }

    /**
    * Fetches a showtime by its ID.
    * 
    * @param id - The ID of the showtime to fetch.
    * @returns The full showtime details.
    * @throws BadRequestException if ID is invalid.
    * @throws NotFoundException if showtime or movie is not found.
    */
    @Get('GetShowTimeById/:id')
    async fetchShowTimeById(@Param('id', ParseIntPipe) id: number): Promise<any> {
        return this.showTimeService.fetchShowTimeById(id);
    }

    /**
    * Updates an existing showtime by its ID.
    * 
    * @param id - The ID of the showtime to update.
    * @param updateShowTimeDto - DTO with fields to update.
    * @returns A success message when the update is complete.
    * @throws BadRequestException for invalid ID or invalid update data.
    * @throws NotFoundException if showtime or movie is not found.
    */
    @Patch('UpdateShowTime/:id')
    async updateShowTimeInfo(@Param('id', ParseIntPipe) id: number, @Body() updateShowTimeDto: UpdateShowTimeDto): Promise<{message: string}> {
        await this.showTimeService.updateShowTimeInfo(id, updateShowTimeDto);
        return { message: `Showtime with ID ${id} successfully updated.` };
    }

    /**
    * Deletes a showtime by its ID.
    * 
    * @param id - The ID of the showtime to delete.
    * @returns A success message when the showtime is deleted.
    * @throws BadRequestException if the ID is invalid.
    * @throws NotFoundException if the showtime does not exist.
    */
    @Delete('DeleteShowTime/:id')
    async deleteShowTime(@Param('id', ParseIntPipe) id: number): Promise<{message: string}> {
        await this.showTimeService.deleteShowTime(id);
        return { message: `Showtime with ID ${id} successfully deleted.` };
    }
}