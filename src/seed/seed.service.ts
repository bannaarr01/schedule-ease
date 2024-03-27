import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { AppointmentStatus } from '../appointment/entities/appointment-status.entity';
import { AppointmentStatusID, AppointmentStatus as AppointmentStatusStrEnum } from '../appointment/enums/appointment-status';
import { LoggerService } from '../logger/logger.service';

@Injectable()
export class SeedService {
   constructor(
    private readonly entityManager: EntityManager,
    private readonly logger: LoggerService
   ) {}

   async seedAppointmentStatus() {
      try {
         // Returns new EntityManager instance with its own identity map
         const entityyManager = this.entityManager.fork()
         // Fetch existing enum values
         const existingStatuses = await entityyManager.findAll(AppointmentStatus);

         // Check if enum values are not already seeded or the length of existing statuses has changed
         if (existingStatuses.length === 0 || existingStatuses.length !== Object.keys(AppointmentStatusStrEnum).length){
            this.logger.getLogger().log('Seeding AppointmentStatus...', SeedService.name + ' seedAppointmentStatus');
            // Seed enum values
            for (const statusKey of Object.keys(AppointmentStatusStrEnum)) {
               const statusName = AppointmentStatusStrEnum[statusKey];
               const statusId = AppointmentStatusID[statusKey];

               const appointmentStatus = entityyManager.create(
                  AppointmentStatus,
                  {
                     id: statusId,
                     statusName: statusName,
                     statusDesc: 'appointment status'
                  }
               )

               await entityyManager.persistAndFlush(appointmentStatus);
            }
            this.logger.getLogger().log('Seeding AppointmentStatus Completed',SeedService.name+' seedAppointmentStatus')
         }
         this.logger.getLogger().log('AppointmentStatus is up to date with no changes.',
            SeedService.name+' seedAppointmentStatus')
      } catch (error) {
         this.logger.getLogger().error('Error seeding AppointmentStatus: ', error,
            SeedService.name + ' seedAppointmentStatus');
         throw error;
      }
   }
}
