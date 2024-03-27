import { Expose, Transform } from 'class-transformer';
import { CalendarEvent } from '../entities/calendar-event.entity';

export class CalendarEventDto {
  @Transform(({ obj }) => obj.map((calEventObj: CalendarEvent) => ({
     ...calEventObj,
     appointmentId: calEventObj.appointmentId.id
  })))
  @Expose()
     calendarEvents: CalendarEventDto[];
}