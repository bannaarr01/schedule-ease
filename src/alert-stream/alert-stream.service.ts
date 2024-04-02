import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { SendEmailDto } from './dtos/send-email.dto';
import { LoggerService } from '../logger/logger.service';

/**
 * Service for sending emails using NestJS Mailer.
 */
@Injectable()
export class AlertStreamService {
   /**
    * Constructs the AlertStreamService.
    * @param mailer The MailerService instance.
    * @param logger The LoggerService instance.
    */
   constructor(
     private readonly mailer: MailerService,
     private readonly logger: LoggerService
   ){}

   /**
    * Sends an email based on the provided emailDto.
    * @param emailDto The SendEmailDto containing email details.
    * @returns A Promise that resolves when the email is sent.
    * @throws Error if there is an error while sending the email.
    */
   async sendEmail(emailDto: SendEmailDto): Promise<void> {
      try {
         const { from, to, subject, cc, bcc, text, html} = emailDto;

         // Construct mail options for sending email
         const mailOptions = {
            from,
            to,
            subject,
            ...(cc && { cc }),
            ...(bcc && { bcc }),
            ...(text && { text }),
            ...(html && { html }),
         };

         // Send the email
         await this.mailer.sendMail(mailOptions);

      } catch(error){
         this.logger.getLogger().error(error.message, error, AlertStreamService.name + ' sendEmail');
         throw new Error(error.message);
      }
   }
}
