import { Expose, Transform, Type } from 'class-transformer';
import { CalendarEventDto } from './calendar-event.dto';
import { ParticipantDto } from './participant.dto';
import { AttachmentDto } from './attachment.dto';
import { LocationDto } from './location.dto';
import { NoteDto } from './note.dto';

export class AppointmentDto {
  @Expose()
     id: number

  @Expose()
     description: string;

  @Expose()
     category?: string;

  @Expose()
     validForStartDateTime: Date;

  @Expose()
     validForEndDateTime: Date;

  @Expose()
     createdAt: Date;

  @Expose()
     creatorId: string;

  @Expose()
     createdBy: string;

  @Expose()
     updatedBy: string;

  @Expose()
     updatedAt: Date;

  @Expose()
     locationLink?: string;

  @Expose()
  @Transform(({ obj }) => obj.status.id)
     statusId: number

   @Expose()
   @Type(() => LocationDto)
      location: LocationDto;

   @Type(() => ParticipantDto)
   @Expose()
      participant: ParticipantDto;

   @Type(() => AttachmentDto)
   @Expose()
      attachment: AttachmentDto;

   @Type(() => NoteDto)
   @Expose()
      note: NoteDto;

   @Type(() => CalendarEventDto)
   @Expose()
      calendarEvent: CalendarEventDto;
}