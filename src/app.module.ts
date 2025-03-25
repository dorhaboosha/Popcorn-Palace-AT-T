/**
 * app.module.ts
 *
 * This is the root module of the Popcorn Palace NestJS application.
 * It sets up the database connection using TypeORM for PostgreSQL and imports feature modules: MovieModule, 
 * ShowTimeModule, and TicketModule.
 * It also registers the relevant entities for ORM-based persistence.
 */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MovieModule } from './movie/movie.module';
import { ShowTimeModule } from './showTime/showTime.module';
import { Movie } from './Movie/movie.entity';
import { ShowTime } from './showTime/showTime.entity';
import { Ticket } from './ticket/ticket.entity';
import { TicketModule } from './ticket/ticket.module';

@Module({
    /**
   * Registers all modules and sets up the PostgreSQL connection using TypeORM.
   * 
   * - Imports the feature modules for movie, showtime, and ticket logic.
   * - Registers TypeORM with PostgreSQL configuration and application entities.
   */
  
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: "popcorn_palace_dor",
      password: "popcorn_palace_dor",
      database: "popcorn_palace_dor",
      entities: [Movie, ShowTime, Ticket],
      synchronize: true
    }),
    MovieModule, ShowTimeModule, TicketModule]
})
export class AppModule {}
