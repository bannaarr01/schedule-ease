import { Entity, OneToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { Appointment } from './appointment.entity';

@Entity()
export class Location {
  @PrimaryKey()
     id!: number;

  @OneToOne(()=> Appointment, appointment => appointment.location)
     appointmentId: Appointment;

  @Property()
     name: string;

  @Property()
     streetNr?: string;

  @Property()
     streetName?: string;

  @Property()
     postCode?: string;

  @Property()
     city?: string;

  @Property()
     stateOrProvince?: string;

  @Property()
     country?: string;
}