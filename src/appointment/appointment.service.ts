import { HttpStatus, Injectable } from '@nestjs/common';
import { LoggerService } from '../logger/logger.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { EntityManager } from '@mikro-orm/mysql';
import { Appointment } from './entities/appointment.entity';
import { ErrorUtil } from '../utils/utils';
import { CreateAttachmentDto } from './dto/create-attachment.dto';
import { Attachment } from './entities/attachment.entity';
import * as path from 'path';
import { promises as fsPromises, existsSync, mkdirSync } from 'fs';

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

   /**
    * Saves a file to the appointment attachment directory.
    *
    * @param file - The file to be saved.
    * @param extension - The file extension.
    * @returns A Promise resolving to the path where the file is saved.
    */
   public async saveFile(file: any, extension: string): Promise<string> {
      const dataDir = path.resolve(process.cwd(), 'data/appointment-attachment');
      const savedFileName = `${new Date().getTime()}${Math.floor(Math.random() * 10000)}.${extension}`;
      const filePath = path.join(dataDir, savedFileName);

      if (!existsSync(dataDir)) {
         mkdirSync(dataDir, { recursive: true }); // Create directory recursively if it doesn't exist
      }

      await fsPromises.writeFile(filePath, file.buffer);

      return filePath;
   }

   /**
    * Creates and persists an attachment for an appointment.
    *
    * @param data The data of type {@link CreateAttachmentDto} required to create the attachment
    * @returns A Promise resolving to the created appointment attachment object.
    * @throws {Error} If there's an error creating or persisting the attachment.
    */
   public async createAndPersistAttachment(data: CreateAttachmentDto) : Promise <any> {
      try {
         const appointmentAttachment = this.entityManager.create(Attachment, data);
         return await this.entityManager.persistAndFlush(appointmentAttachment);
      } catch (error) {
         this.logger.getLogger().error(error.message, error, AppointmentService.name + ' createAndPersistAttachment')
         ErrorUtil.throwError('DB or Query Error', HttpStatus.INTERNAL_SERVER_ERROR);
      }
   }

   /**
    * Retrieves an appointment by its unique identifier.
    * @param appointmentId The ID of the appointment to retrieve.
    * @returns {Promise <Appointment>} A Promise resolving to the retrieved appointment, if found.
    *          Throws an error with status 400 if the appointment is not found.
    */
   public async getAppointment(appointmentId: number) : Promise <Appointment> {
      const appointment = await this.entityManager.findOne(Appointment, {id: appointmentId});
      if(!appointment) ErrorUtil.throwError('invalid appointment id', HttpStatus.BAD_REQUEST);
      return appointment;
   }

}
