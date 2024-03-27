import { IsNumber, IsString } from 'class-validator';

export class CreateAttachmentDto {
  @IsNumber()
     appointmentId: number;

  @IsString()
     attachmentType: string;

  @IsString()
     originalName: string;

  @IsString()
     mimeType: string;

  @IsString()
     path: string;

  @IsNumber()
     size: number;

  @IsString()
     uploadedById: string;

  @IsString()
     uploadedByName: string;

  @IsString()
     description: string;
}