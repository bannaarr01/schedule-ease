import { Cascade, Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { Appointment } from './appointment.entity';

@Entity()
export class Note {
  @PrimaryKey()
     id!: number;
  
  @ManyToOne(()=> Appointment, {fieldName: 'appointment_id', cascade: [Cascade.PERSIST], eager: true } )
     appointmentId: Appointment
  
  @Property()
     author: string;

  @Property({ length: 1000 })
     text: string;

  @Property({ onCreate: () => new Date() })
     createdAt: Date;
}