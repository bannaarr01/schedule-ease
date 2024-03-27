import { BeforeCreate, BeforeUpdate, Entity, OneToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { HttpStatus } from '@nestjs/common';
import { ErrorUtil } from '../../utils/error.util';
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
     contactMediumId: ContactMedium;

  // Validate logic before persisting using Lifecycle Hooks
  @BeforeCreate()
  @BeforeUpdate()
  async validateContactAttribute() {
     if (!this.phoneNumber && !this.email) {
        ErrorUtil.throwError('Either phoneNumber or email is required', HttpStatus.UNPROCESSABLE_ENTITY);
     }
  }
}