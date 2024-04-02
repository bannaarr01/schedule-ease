import { IsString, IsEmail, IsOptional, IsArray, ValidateNested, IsMimeType, IsDefined } from 'class-validator';
import { Type } from 'class-transformer';

class AttachmentDto {
   @IsString()
      fieldname: string;

   @IsString()
      originalname: string;

   @IsString()
      encoding: string;

   @IsString()
   @IsMimeType()
      mimetype: string;

   @IsDefined()
      buffer: Buffer;

   @IsDefined()
      size: number;
}

/**
 * Data Transfer Object (DTO) for sending emails.
 * Contains email details such as sender, recipients, subject, message body, and attachments.
 */
export class SendEmailDto {
   /** The sender's email address. */
   @IsString()
      from: string;

   /** The primary recipient's email address. */
   @IsEmail()
      to: string;

   /** The subject of the email. */
   @IsString()
      subject: string;

   /**
    * Comma-separated list or an array of recipients' email addresses
    * that will appear on the Cc: field.
    */
   @IsOptional()
   @IsEmail({},{ each: true })
      cc?: string | string[];

   /**
    * Comma-separated list or an array of recipients' email addresses
    * that will appear on the Bcc: field.
    */
   @IsOptional()
   @IsEmail({},{ each: true })
      bcc?: string | string[];

   /** The text content of the email message. */
   @IsOptional()
   @IsString()
      text?: string;

   /** The HTML content of the email message. */
   @IsOptional()
   @IsString()
      html?: string;

   /** An array of attachments to be included in the email. */
   @IsOptional()
   @IsArray()
   @ValidateNested({ each: true })
   @Type(() => AttachmentDto)
      attachments?: AttachmentDto[];
}