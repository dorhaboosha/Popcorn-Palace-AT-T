/**
* movie.module.ts
* 
* This module bundles all logic related to the Movie feature.
* It registers the Movie entity, controller, service, and repository so they can be used across the application.
* 
* - Registers the 'Movie' entity with TypeORM.
* - Provides the 'MovieController' to handle incoming HTTP requests.
* - Provides the 'MovieService; to encapsulate business logic.
* - Uses a custom factory to instantiate 'MovieRepository' with TypeORM's DataSource.
* - Exports 'MovieService' and 'MovieRepository' so they can be injected into other modules (e.g., ShowTime).
*/

import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { MovieController } from "./movie.controller";
import { MovieService } from "./movie.service";
import { MovieRepository } from "./movie.repository";
import { Movie } from "./movie.entity";
import { DataSource } from "typeorm";


@Module({
    imports: [TypeOrmModule.forFeature([Movie])], 
    controllers: [MovieController], 
    providers: [MovieService, 
        {provide: 'MovieRepository', useFactory: (dataSource: DataSource) => new MovieRepository(dataSource), inject: [DataSource]}
    ],
    exports: [MovieService, 'MovieRepository'] 
})
export class MovieModule {
    constructor() {
        console.log('MovieModule loaded');
    }
}