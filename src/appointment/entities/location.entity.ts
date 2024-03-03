import { Cascade, Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { Appointment } from './appointment.entity';

@Entity()
export class Location {
  @PrimaryKey()
     id!: number;

  @ManyToOne(()=> Appointment, {fieldName: 'appointment_id', cascade: [Cascade.PERSIST], eager: true } )
     appointmentId: Appointment;

  @Property()
     name: string;

  @Property()
     streetNr: string;

  @Property()
     streetName: string;

  @Property()
     postCode: string;

  @Property()
     city: string;

  @Property()
     stateOrProvince: string;

  @Property()
     country: string;
}