import { HttpStatus, Injectable } from '@nestjs/common';
import { LoggerService } from '../logger/logger.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { EntityManager } from '@mikro-orm/mysql';
import { Appointment } from './entities/appointment.entity';
import { ErrorUtil } from '../utils/utils';

@Injectable()
export class AppointmentService {
   constructor(
    private readonly entityManager: EntityManager,
    private readonly logger: LoggerService
   ) {}

   /**
    * Creates a new appointment.
    *
    * @param {any} user - The user object representing the creator of the appointment.
    * @param {CreateAppointmentDto} createAppointmentDto -The DTO (Data Transfer Object)
    * containing details of the appointment to be created.
    * @returns {Promise<Appointment>} - A Promise that resolves to the created appointment object.
    * @throws {Error} - Throws an error if there is an issue creating the appointment.
    */
   public async createAnAppointment(user: any, createAppointmentDto: CreateAppointmentDto): Promise<Appointment>{
      try{
         const appointment = this.entityManager
            .create(
               Appointment, 
               { ...createAppointmentDto, createdBy: user.name, creatorId: user.sub }
            );
         await this.entityManager.persistAndFlush(appointment);
         return appointment;
      }catch (error){
         this.logger.getLogger().error(error.message, error, AppointmentService.name + ' createAppointment')
         ErrorUtil.throwError('DB or Query Error', HttpStatus.INTERNAL_SERVER_ERROR);
      }
   }
}
