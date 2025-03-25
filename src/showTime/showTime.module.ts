/**
* showTime.module.ts
* 
* This file defines the ShowTimeModule, which encapsulates all functionality
* related to movie showtimes in the application.
* 
* Responsibilities:
* - Registers the 'ShowTime' entity with TypeORM.
* - Provides and exports the 'ShowTimeService' for business logic.
* - Registers the 'ShowTimeRepository' via a custom provider using a factory.
* - Imports 'MovieModule' to enable showtime validation with existing movies.
* - Declares the 'ShowTimeController' to expose HTTP endpoints.
* 
* This module is self-contained and can be imported by other modules that
* require showtime functionality.
*/

import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ShowTimeController } from "./showTime.controller";
import { ShowTimeService } from "./showTime.service";
import { ShowTimeRepository } from "./showTime.repository";
import { ShowTime } from "./showTime.entity";
import { MovieModule } from "src/movie/movie.module";
import { DataSource } from "typeorm";


@Module({
    imports: [TypeOrmModule.forFeature([ShowTime]), MovieModule],
    controllers: [ShowTimeController],
    providers: [ShowTimeService, {provide: 'ShowTimeRepository',
        useFactory: (datasource: DataSource) => new ShowTimeRepository(datasource), inject: [DataSource]}],
    exports: [ShowTimeService, 'ShowTimeRepository']
})
export class ShowTimeModule {
    constructor() {
    /**
    * Logs a message when the module is loaded.
    * This is mostly for debugging and initialization verification.
    */
        console.log('showTimeModule loaded');
    }
}