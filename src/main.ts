/**
 * main.ts- 
 * This is the main entry point for the Popcorn Palace NestJS application.
 * It bootstraps the NestJS application by loading the root AppModule, applies global validation pipe for request validation
 * and starts the server on port 3000.
 */

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

/**
 * bootstrap()
 *
 * Initializes the NestJS application:
 * - Creates an instance using AppModule.
 * - Applies global validation pipe to enforce DTO validation.
 * - Starts listening on port 3000.
 *
 * Returns: void
 * Throws: Logs and exits process on error during initialization.
 */

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);
    console.log("NestJS application initialized.");
    app.useGlobalPipes(new ValidationPipe());
    await app.listen(3000);
    console.log("NestJS application is running on port 3000.");
  }

  catch (error) {
    console.error("Error initializing NestJS application:", error);
    process.exit(1);
  }
}
bootstrap();
