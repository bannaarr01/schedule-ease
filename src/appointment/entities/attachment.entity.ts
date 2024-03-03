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
     content?: string;

  @Property()
     description?: string;

  @Property({ onCreate: () => new Date()})
     uploadedAt = new Date();

  constructor(
     appointmentId: Appointment,
     attachmentType: string,
     originalName: string,
     mimeType: string,
     path: string,
     size: number,
     content:string,
     description: string
  ) {
     this.appointmentId = appointmentId;
     this.attachmentType = attachmentType;
     this.originalName = originalName;
     this.mimeType = mimeType;
     this.path = path;
     this.size = size;
     this.content = content;
     this.description = description;
  }
}