import { Cascade, Entity, ManyToOne, OneToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { Appointment } from './appointment.entity';
import { ContactMedium } from './contact-medium.entity';

@Entity()
export class Participant {
  @PrimaryKey()
     id!: number;

  @Property()
     name: string;

  @Property() // customer, technician, supervisor etc
     role: string;

  @ManyToOne(()=> Appointment, {fieldName: 'appointment_id', cascade: [Cascade.PERSIST], eager: false } )
     appointmentId: Appointment;

  @OneToOne(() => ContactMedium, contactMedium => contactMedium.participantId, { owner: true })
     contactMedium: ContactMedium;
}