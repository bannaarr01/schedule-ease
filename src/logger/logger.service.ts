import { Injectable, Logger } from '@nestjs/common';
import * as rfs from 'rotating-file-stream';

/**
 * Custom Logger service for logging messages, errors, and exceptions with rotating file streams.
 * Uses the 'rotating-file-stream' package to create rotating log files for different log levels.
 */
@Injectable()
export class LoggerService extends Logger {

   private fileStream: any;
   private errorStream: any;
   private exceptionStream: any;

   /**
    * Initializes rotating file streams for general logs, errors, and exceptions.
    */
   constructor() {
      super();
      this.initializeStreams();
   }

   /**
    * Retrieves the logger instance.
    * @returns Logger instance
    */
   getLogger(): Logger {
      return this;
   }

   /**
    * Initializes rotating file streams for general logs, errors, and exceptions.
    */
   private initializeStreams(): void {
      // General log file
      this.fileStream = rfs.createStream('application.log', {
         interval: '1d', // rotate daily
         path: 'logs/applications',
         compress: 'gzip', // compress rotated files
      });

      // Error log file
      this.errorStream = rfs.createStream('error.log', {
         interval: '1d',
         path: 'logs/errors',
         compress: 'gzip',
      });

      // Exception log file
      this.exceptionStream = rfs.createStream('exceptions.log', {
         interval: '1d',
         path: 'logs/exceptions',
         compress: 'gzip',
      });
   }

   /**
    * Logs a message with the specified context.
    * @param message The message to log
    * @param context Optional context information
    */
   log(message: any, context?: string) {
      super.log(message, context);
      this.fileStream.write(`[${new Date().toISOString()}] [${context}] LOG: ${message}\n`);
   }

   /**
    * Logs an error message with the specified context and optional trace.
    * @param message The error message to log
    * @param context Optional context information
    * @param trace Optional error trace
    */
   error(message: any, context?: string, trace?: string) {
      super.error(message, trace, context);
      this.fileStream.write(`[${new Date().toISOString()}] [${context}] ERROR: ${message}\n`);
      this.errorStream.write(`[${new Date().toISOString()}] [${context}] ERROR: ${message}\n`);
   }

   /**
    * Logs a warning message with the specified context.
    * @param message The warning message to log
    * @param context Optional context information
    */
   warn(message: any, context?: string) {
      super.warn(message, context);
      this.fileStream.write(`[${new Date().toISOString()}] [${context}] WARN: ${message}\n`);
   }

   /**
    * Logs an exception with the specified context.
    * @param exception The exception to log
    * @param context Optional context information
    */
   logException(exception: Error, context?: string) {
      const message = exception.message;
      const stack = exception.stack;
      this.fileStream.write(`[${new Date().toISOString()}] [${context}] EXCEPTION: ${
         message}\nStack Trace: ${stack}\n`);
      this.errorStream.write(`[${new Date().toISOString()}] [${context}] EXCEPTION: ${
         message}\nStack Trace: ${stack}\n`);
      this.exceptionStream.write(`[${new Date().toISOString()}] [${context}] EXCEPTION: ${
         message}\nStack Trace: ${stack}\n`);
   }
}
