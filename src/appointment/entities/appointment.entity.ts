import { Entity, PrimaryKey } from '@mikro-orm/core';

@Entity()
export class Appointment {
  @PrimaryKey()
     id: number
}