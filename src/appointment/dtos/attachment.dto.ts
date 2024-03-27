import { Expose, Transform } from 'class-transformer';
import { Attachment } from '../entities/attachment.entity';

export class AttachmentDto {
  @Transform(({ obj }) => obj.map((attachmentObj: Attachment) => ({
     ...attachmentObj,
     appointmentId: attachmentObj.appointmentId.id,
  })))
  @Expose()
     attachments: AttachmentDto[];
}