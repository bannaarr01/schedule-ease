import { Entity, OneToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { ContactMedium } from './contact-medium.entity';

@Entity()
export class ContactMediumAttribute{
  @PrimaryKey()
     id: number;

  @Property()
     phoneNumber?: string;
 
  @Property()
     email?: string;

  @Property()
     faxNumber?: string;

  @Property()
     socialNetworkId?: string;

  @Property()
     street?: string;

  @Property()
     city?: string;

  @Property()
     stateOrProvince?: string;

  @Property()
     country?: string;

  @OneToOne(() => ContactMedium, contactMedium => contactMedium.attribute)
     contactMediumId?: ContactMedium;
}