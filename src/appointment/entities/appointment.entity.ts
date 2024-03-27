import {
   Enum,
   Entity,
   Cascade,
   OneToOne,
   Property,
   OneToMany,
   ManyToOne,
   PrimaryKey,
   Collection,
   BeforeUpdate,
   BeforeCreate,
} from '@mikro-orm/core';
import { HttpStatus } from '@nestjs/common';
import { AppointmentStatus } from './appointment-status.entity';
import { CalendarEvent } from './calendar-event.entity';
import { LocationType } from '../enums/location-type';
import { ErrorUtil } from '../../utils/error.util';
import { Participant } from './participant.entity';
import { Attachment } from './attachment.entity';
import { Location } from './location.entity';
import { Note } from './note.entity';

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

  @ManyToOne(() => AppointmentStatus,{ cascade: [Cascade.PERSIST, Cascade.REMOVE], eager: false, deleteRule: 'cascade' })
     status: AppointmentStatus;

  @Property({ onCreate: () => new Date() })
     createdAt: Date;

  @Property({ nullable: true })
     updatedBy?: string;

  @Property({ onCreate: () => new Date(), onUpdate: () => new Date() })
     updatedAt: Date;

  @Enum(() => LocationType)
     locationType: LocationType;

  @Property()
     locationLink?: string;

  @OneToMany(() => Participant, participant => participant.appointmentId,
     { cascade: [Cascade.PERSIST], eager: false })
     participant = new Collection<Participant>(this);

  @OneToOne(() => Location, location => location.appointmentId, { owner: true } )
     location: Location;

  @OneToMany(() => Attachment, attachment => attachment.appointmentId, { cascade: [Cascade.PERSIST], eager: false })
     attachment? = new Collection<Attachment>(this);

  @OneToMany(() => CalendarEvent, calendarEvent => calendarEvent.appointmentId,
     { cascade: [Cascade.PERSIST], eager: false })
     calendarEvent? = new Collection<CalendarEvent>(this);

  @OneToMany(() => Note, note => note.appointmentId,{ cascade: [Cascade.PERSIST], eager: false })
     note? = new Collection<Note>(this);

  @BeforeCreate()
  @BeforeUpdate()
  async validateLocationLink() {
     if (this.locationType === LocationType.ONLINE && !this.locationLink) {
        ErrorUtil.throwError('Location or meeting link is required for online appointments.',
           HttpStatus.UNPROCESSABLE_ENTITY);
     }
  }
}