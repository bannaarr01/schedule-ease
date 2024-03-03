import { Cascade, Entity, ManyToOne, OneToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { ContactMediumType } from '../contact-medium-type';
import { ContactMediumAttribute } from './contact-mendium-attriibute.entity';
import { Appointment } from './appointment.entity';

@Entity()
export class ContactMedium {
  @PrimaryKey()
     id: number;

  @ManyToOne(()=> Appointment, {fieldName: 'appointment_id', cascade: [Cascade.PERSIST], eager: true } )
     appointmentId: Appointment;
  
  @Property()
     mediumType?: ContactMediumType;

  @OneToOne(() => ContactMediumAttribute, attribute => attribute.contactMediumId, { owner: true })
     attribute?: ContactMediumAttribute;
}