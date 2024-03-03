import { Cascade, Collection, Entity, OneToMany, PrimaryKey, Property } from '@mikro-orm/core';
import { RelatedParty } from './related-party.entity';
import { Location } from './location.entity';
import { AppointmentStatus } from '../appointment-status';
import { Attachment } from './attachment.entity';
import { ContactMedium } from './contact-medium.entity';
import { CalendarEvent } from './calendar-event.entity';
import { Note } from './note.entity';
import { LocationType } from './location-type';

@Entity()
export class Appointment {
  @PrimaryKey()
     id!: number;

  @Property()
     description: string;

  @Property()
     creatorId: string;

  @Property()
     createdBy: string;

  @Property()
     category: string;
  
  @Property()
     validForStartDateTime: Date;

  @Property()
     validForEndDateTime: Date;

  @Property({ onCreate: () => AppointmentStatus.CREATED })
     status: AppointmentStatus;

  @Property({ onCreate: () => new Date() })
     createdAt: Date;

  @Property({ onCreate: () => new Date(), onUpdate: () => new Date() })
     updatedAt: Date;

  @Property()
     locationType?: LocationType;

  @Property()
     locationLink?: string;

  @OneToMany(() => Location, location => location.appointmentId,{ cascade: [Cascade.PERSIST], eager: false })
     location? = new Collection<Location>(this);
  
  @OneToMany(() => RelatedParty, relatedParty => relatedParty.appointmentId,
     { cascade: [Cascade.PERSIST], eager: false })
     relatedParty? = new Collection<RelatedParty>(this);

  @OneToMany(() => Attachment, attachment => attachment.appointmentId, { cascade: [Cascade.PERSIST], eager: false })
     attachment? = new Collection<Attachment>(this);

  @OneToMany(() => CalendarEvent, calendarEvent => calendarEvent.appointmentId, 
     { cascade: [Cascade.PERSIST], eager: false })
     calendarEvent? = new Collection<CalendarEvent>(this);
  
  @OneToMany(() => ContactMedium, contactMedium => contactMedium.appointmentId, 
     { cascade: [Cascade.PERSIST], eager: false })
     contactMedium? = new Collection<ContactMedium>(this);

  @OneToMany(() => Note, note => note.appointmentId,{ cascade: [Cascade.PERSIST], eager: false })
     note? = new Collection<Note>(this);
}