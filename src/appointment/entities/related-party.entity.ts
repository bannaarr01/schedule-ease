import { Cascade, Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { Appointment } from './appointment.entity';

@Entity()
export class RelatedParty {
  @PrimaryKey()
     id!: number;

  @Property()
     name: string;

  @Property() //customer, technician etc
     role: string;
  
  @ManyToOne(()=> Appointment, {fieldName: 'appointment_id', cascade: [Cascade.PERSIST], eager: true } )
     appointmentId: Appointment;
}