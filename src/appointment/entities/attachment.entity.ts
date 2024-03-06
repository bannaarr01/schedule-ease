import { Cascade, Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { Appointment } from './appointment.entity';

@Entity()
export class Attachment {
  @PrimaryKey()
     id!: number;

  @ManyToOne(()=> Appointment, {fieldName: 'appointment_id', cascade: [Cascade.PERSIST], eager: true } )
     appointmentId: Appointment;

  @Property() //e.g "report.pdf"
     attachmentType: string;

  @Property() //e.g application/pdf
     mimeType: string;

  @Property()
     originalName: string;

  @Property()
     path: string;

  @Property()
     size: number;

  @Property()
     uploadedById: string;

  @Property()
     uploadedByName: string;

  @Property()
     description?: string;

  @Property({ onCreate: () => new Date()})
     uploadedAt = new Date();

}