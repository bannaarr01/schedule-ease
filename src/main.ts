import morgan from 'morgan';
import { AppModule } from './app.module';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { LoggerService } from './logger/logger.service';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { DbMigrationService } from './db-migration/db-migration.service';
import { SeedService } from './seed/seed.service';

async function bootstrap() {
   const app = await NestFactory.create(AppModule);

   const migrationService = app.get(DbMigrationService);

   const seedService = app.get(SeedService);

   // Enable Cross-Origin Resource Sharing (CORS)
   app.enableCors();

   // Apply global validation pipes
   app.useGlobalPipes(new ValidationPipe({ transform: true }));

   // Get the logger service
   const logger = app.get(LoggerService);

   // Configure Morgan logging middleware for HTTP requests
   app.use(morgan(
      ':method :url :status :res[content-length] - :response-time ms',
      {
         stream: {
            write: (message: any) => logger.getLogger().log(message, 'API'),
         },
      }
   ));

   // Configure Swagger documentation, Create the Swagger document & Set up Swagger UI
   const config = new DocumentBuilder()
      .setTitle('Schedule Ease Appointment Service API')
      .setVersion(process.env.npm_package_version)
      .addBearerAuth()
      .build();

   const document = SwaggerModule.createDocument(app, config);
   SwaggerModule.setup('docs', app, document);

   try {
      // Run migrations before starting the app
      await migrationService.runMigrations();
      // Seed Appointment Status Enums to DB
      await seedService.seedAppointmentStatus();
      // Start the application on the specified port or default to 8501
      await app.listen(process.env.PORT || 8501);
      logger.getLogger().log(`Application is running on: ${await app.getUrl()}`, 'APP bootstrap');
   } catch (error){
      console.error('Error starting application:', error);
      process.exit(1);
   }

}
bootstrap()
