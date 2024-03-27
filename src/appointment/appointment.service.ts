import { existsSync, mkdirSync, promises as fsPromises } from 'fs';
import { HttpStatus, Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/mysql';
import * as moment from 'moment';
import * as path from 'path';
import { CreateAppointmentDto } from './dtos/create-appointment.dto';
import { CreateAttachmentDto } from './dtos/create-attachment.dto';
import { AppointmentStatusID } from './enums/appointment-status';
import { Appointment } from './entities/appointment.entity';
import { Attachment } from './entities/attachment.entity';
import { LoggerService } from '../logger/logger.service';
import { AppointmentDto } from './dtos/appointment.dto';
import { CreateNotesDto } from './dtos/create-note.dto';
import { LogEntry } from './entities/log-entry.entity';
import { ErrorUtil } from '../utils/error.util';
import { LogAction } from './enums/log-action';
import { MiscUtils } from '../utils/misc.util';
import { Note } from './entities/note.entity';

/**
 * Service for managing appointments.
 */
@Injectable()
export class AppointmentService {
   /**
    * Minimum appointment time in minutes.
    */
   minAppointmentTimeInMins: number;
   constructor(
    private readonly entityManager: EntityManager,
    private readonly logger: LoggerService
   ) {
      // get from env to make it adjustable
      this.minAppointmentTimeInMins = parseInt(process.env.MIN_APPOINTMENT_TIME_IN_MINS);
   }

   /**
    * Creates a new appointment.
    *
    * @param {any} user - The user object representing the creator of the appointment.
    * @param {CreateAppointmentDto} appointmentDto - The DTO (Data Transfer Object) containing details of the
    * appointment to be created.
    * @returns {Promise<any>} - A Promise that resolves to the created appointment object.
    * @throws {Error} - Throws an error if there is an issue creating the appointment.
    */
   public createAnAppointment(user: any, appointmentDto: CreateAppointmentDto): Promise<any> {
      return new Promise(async (resolve, reject) => {
         try {
            // Validate the appointment to be created time
            this.validateAppointmentTime(appointmentDto.validForStartDateTime, appointmentDto.validForEndDateTime);

            // Check for appointment conflicts
            const isConflictAppointment = await this.isAppointmentConflict(appointmentDto);

            // If there's a conflict, throw error
            if (isConflictAppointment) {
               ErrorUtil.throwError('Appointment conflict detected.', HttpStatus.BAD_REQUEST)
               return;
            }

            // Create appointment within a transaction
            const appointment = await this.entityManager.transactional(async em => {
               // Create new appointment entity
               const newAppointment = em.create(
                  Appointment,
                  {
                     ...appointmentDto,
                     status: AppointmentStatusID.CREATED,
                     createdBy: user.name,
                     creatorId: user.sub
                  }
               );

               // Await Persist And Flush new appointment entity to use its ID to log
               await em.persistAndFlush(newAppointment);

               // Serialize appointment data
               const serializedAppointment: AppointmentDto = (MiscUtils.serialize(AppointmentDto, newAppointment))

               // Create log entry for the appointment creation
               const logAppointment = em.create(
                  LogEntry,
                  new LogEntry(
                     newAppointment.id,
                     'Appointment',
                     LogAction.CREATE,
                     null,
                     JSON.stringify(serializedAppointment),
                     user.sub,
                     user.name,
                  )
               )
               em.persist(logAppointment);

               return serializedAppointment;
            });

            resolve(appointment);
         } catch (error) {
            const rejectionError = error.customErrMsg ? error : new Error('DB or Query Error');
            this.logger.getLogger().error(error.message, error, AppointmentService.name + ' createAnAppointment');
            reject(rejectionError);
         }
      });
   }

   /**
    * Checks if there is a conflict with the provided appointment details.
    *
    * @param {CreateAppointmentDto} appointmentDto - The DTO (Data Transfer Object)
    * containing details of the appointment to be checked for conflicts.
    * @returns {Promise<boolean>} - A Promise that resolves to true if there is a conflict, otherwise resolves to false.
    * @throws {Error} - Throws an error if there is an issue checking for conflicts.
    */
   private async isAppointmentConflict(appointmentDto: CreateAppointmentDto): Promise<boolean> {
      try {
         // Extract participant contact information
         const participantContactAttribute = appointmentDto.participant.map(p => p.contactMedium.attribute);
         const participantPhoneNumber = participantContactAttribute.map(attr => attr.phoneNumber).filter(Boolean);
         const participantEmail = participantContactAttribute.map(attr => attr.email).filter(Boolean);

         // Format start and end times
         const dateTimeFormat = 'yyyy-MM-DD HH:mm:ss';
         const startTime = moment(appointmentDto.validForStartDateTime).format(dateTimeFormat);
         const endTime = moment(appointmentDto.validForEndDateTime).format(dateTimeFormat);

         // Find conflicting appointments
         const conflictAppointment = await this.entityManager.find(Appointment, {
            participant: {
               contactMedium: {
                  attribute: {
                     $or: [
                        {  phoneNumber: { $in: participantPhoneNumber } },
                        {  email: { $in: participantEmail } }
                     ]
                  }
               }
            },
            // Check for overlapping time intervals
            validForStartDateTime: {
               $gte: startTime
            },
            validForEndDateTime: {
               $lte: endTime
            }
         });

         // Return true if conflicts exist
         return conflictAppointment.length > 0;
      } catch (error) {
         this.logger.getLogger().error(error.message, error, AppointmentService.name + ' isAppointmentConflict');
         ErrorUtil.throwError('Unable to check appointment conflict.');
      }
   }

   /**
    * Validates the appointment start and end times.
    *
    * @param {Date} startDate - The start date and time of the appointment.
    * @param {Date} endDate - The end date and time of the appointment.
    * @throws {Error} - Throws an error if the appointment start or end time is invalid.
    */
   private validateAppointmentTime(startDate: Date, endDate: Date): void {
      // Get current time
      const now = moment();

      // Check if start or end date is in the past
      if (moment(startDate).isBefore(now) || moment(endDate).isBefore(now)) {
         ErrorUtil.throwError('Appointment Start date or end date cannot be in the past', HttpStatus.BAD_REQUEST);
      }

      // Check if end date is before start date
      if (moment(endDate).isBefore(startDate)) {
         ErrorUtil.throwError('Appointment end date cannot be before start date', HttpStatus.BAD_REQUEST);
      }

      // Calculate duration of the appointment
      const diffInMinutes = moment(endDate).diff(startDate, 'minutes');

      // Ensure appointment duration is at least the set minimum Appointment Time Frame in minutes
      if (diffInMinutes < this.minAppointmentTimeInMins) {
         ErrorUtil.throwError('Appointment Schedule must be at least 10 minutes', HttpStatus.BAD_REQUEST);
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
    * @param user The user object containing user information.
    * @returns {Promise <Appointment>} A Promise resolving to the retrieved appointment, if found.
    *          Throws an error with status 400 if the appointment is not found.
    */
   public async getAppointment(appointmentId: number, user: any) : Promise <Appointment> {
      const filteringParams: any =  { id: appointmentId }

      // Drill down to retrieve only the user Appointment if the auth user is user role
      if(this.isUserRole(user)) filteringParams['creator_id'] = user.sub;

      const appointment = await this.entityManager.findOne(
         Appointment,
         { ...filteringParams },
         {
            populate: [
               'participant',
               'participant.contactMedium',
               'participant.contactMedium.attribute',
               'location',
               'attachment',
               'note',
               'calendarEvent'
            ]
         }
      );
      if(!appointment) ErrorUtil.throwError('invalid appointment id', HttpStatus.BAD_REQUEST);
      return appointment;
   }

   /**
    * Checks if the user has a specific role of 'user'.
    * @param user The user object to check for roles.
    * @returns A boolean indicating whether the user has the user role.
    */
   private isUserRole = (user: any) => user.realm_access.roles.some((role: string) => role.includes('user'));

   /**
    * Checks the status of an appointment.
    * @param status The status of the appointment.
    * @throws ErrorUtil with a message and HTTP status code if the appointment is cancelled or completed.
    */
   public checkAppointmentStatus(status: number): void {
      if (!
      [  AppointmentStatusID.CREATED,
         AppointmentStatusID.ASSIGNED,
         AppointmentStatusID.RESCHEDULED
      ].includes(status)) {
         ErrorUtil.throwError('Appointment has been cancelled or completed', HttpStatus.BAD_REQUEST);
      }
   }

   /**
    * Creates appointment notes.
    * @param createNotesDto The DTO containing the notes to be created.
    * @param appointmentId The ID of the appointment for which notes are created.
    * @param user The user object representing the author of the notes.
    * @returns A promise that resolves with the created notes.
    * @throws ErrorUtil with a message and HTTP status code if there is a database or query error.
    */
   public async createAppointmentNote(createNotesDto: CreateNotesDto, appointmentId: number, user: any){
      try {
         const notesToCreate =  createNotesDto.note.map(text => ({
            ...text,
            appointmentId: appointmentId,
            author: user.sub
         }));

         // Persist the array of notes
         const createdNotes = await Promise.all(
            notesToCreate.map(noteData => this.entityManager.create(Note, noteData))
         );

         return await Promise.all(createdNotes.map(note => this.entityManager.persistAndFlush(note)));
      } catch (error) {
         this.logger.getLogger().error(error.message, error, AppointmentService.name + ' createAppointmentNote')
         ErrorUtil.throwError('DB or Query Error', HttpStatus.INTERNAL_SERVER_ERROR);
      }
   }

}
