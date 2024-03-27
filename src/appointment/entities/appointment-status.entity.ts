import { Cascade, Collection, Entity, OneToMany, PrimaryKey, Property } from '@mikro-orm/core';
import { Appointment } from './appointment.entity';

@Entity()
export class AppointmentStatus {
  @PrimaryKey()
     id: number;

  @Property()
     statusName: string;

  @Property()
     statusDesc?: string;

  @OneToMany(() => Appointment, appointment => appointment.status,
     { cascade: [Cascade.PERSIST, Cascade.REMOVE], eager: false, orphanRemoval: true })
     appointment = new Collection<Appointment>(this);
}