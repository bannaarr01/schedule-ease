import { Module } from '@nestjs/common';
import { AlertStreamService } from './alert-stream.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { LoggerService } from '../logger/logger.service';

@Module({
   imports: [
      /**
       * Configuration for setting up the MailerModule with SMTP transport.
       *
       * This configuration initializes the MailerModule with SMTP transport settings.
       * It includes options for host, port, security, and authentication.
       */
      MailerModule.forRoot({
         /**
          * Transport settings for sending emails.
          */
         transport: {
            /**
             * The hostname of the mail server.
             */
            host: process.env.MAIL_HOST,
            /**
             * The port number of the mail server.
             */
            port: parseInt(process.env.MAIL_PORT),
            /**
             * Indicates whether the connection should use TLS (secure) or not.
             */
            secure: false,
            /**
             * Authentication credentials for the mail server.
             */
            auth: {
               /**
                * The username for authentication.
                */
               user: process.env.MAIL_AUTH_USER,
               /**
                * The password for authentication.
                */
               pass: process.env.MAIL_AUTH_PASS
            },
         },
      }),
   ],
   providers: [AlertStreamService, LoggerService]
})
export class AlertStreamModule {}
