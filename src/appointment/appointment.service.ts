import { CreateParticipantDto, CreateParticipantsDto } from './dtos/create-participant.dto';
import { HttpStatus, Injectable, UnprocessableEntityException } from '@nestjs/common';
import { RescheduleAppointmentDto } from './dtos/reschedule-appointment.dto';
import { CreateAppointmentDto } from './dtos/create-appointment.dto';
import { existsSync, mkdirSync, promises as fsPromises } from 'fs';
import { EntityManager, QueryOrder, wrap } from '@mikro-orm/mysql';
import { CreateAttachmentDto } from './dtos/create-attachment.dto';
import { AppointmentStatusID } from './enums/appointment-status';
import { GetAppointmentDto } from './dtos/get-appointment.dto';
import { Participant } from './entities/participant.entity';
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
import moment from 'moment';
import * as path from 'path';
import _ from 'lodash';


/**
 * Service for managing appointments.
 */
@Injectable()
export class AppointmentService {
   /**
    * Minimum appointment time in minutes.
    */
   minAppointmentTimeInMins: number;
   /**
    * Maximum appointment time in minutes.
    */
   maxAppointmentTimeInMins: number;
   constructor(
    private readonly entityManager: EntityManager,
    private readonly logger: LoggerService
   ) {
      // get from env to make it adjustable
      this.minAppointmentTimeInMins = parseInt(process.env.MIN_APPOINTMENT_TIME_IN_MINS);
      this.maxAppointmentTimeInMins = parseInt(process.env.MAX_APPOINTMENT_TIME_IN_MINS);
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
               await this.logAppointment(user, newAppointment, LogAction.CREATE,null)

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
   public async isAppointmentConflict(appointmentDto: CreateAppointmentDto): Promise<boolean> {
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
   public validateAppointmentTime(startDate: Date, endDate: Date): void {
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
         ErrorUtil.throwError(`Appointment Schedule must be at least ${this.minAppointmentTimeInMins} minutes`,
            HttpStatus.BAD_REQUEST);
      }

      // Ensure appointment duration does not exceed the set max appointment time in minutes
      if (diffInMinutes > this.maxAppointmentTimeInMins) {
         const hourOrMin = this.maxAppointmentTimeInMins > 60
            ? `${(this.maxAppointmentTimeInMins / 60)} hours` : `${this.maxAppointmentTimeInMins} minutes`
         ErrorUtil.throwError(`Appointment duration cannot exceed ${hourOrMin}`, HttpStatus.BAD_REQUEST);
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
      if(!appointment) ErrorUtil.throwError('appointment not found', HttpStatus.NOT_FOUND);
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

   public async updateAppointment(
      appointment: Appointment,
      user: any,
      statusId: AppointmentStatusID,
      rescheduleDto?: RescheduleAppointmentDto
   ){
      try{
         // Deep clone the appointment object
         const initialAppointmentCopy = _.cloneDeep(appointment);

         // Validate input and perform necessary checks
         await this.validateUpdateInput(appointment, statusId, rescheduleDto);

         // Update appointment data
         const updatedAppointment = this.updateAppointmentData(appointment, user, statusId, rescheduleDto);

         // Persist updated appointment
         await this.entityManager.persistAndFlush(updatedAppointment);

         // Log appointment update
         return await this.logAppointment(user, updatedAppointment, LogAction.UPDATE, initialAppointmentCopy);
      } catch (error){
         const rejectionError = error.customErrMsg ? error : new Error('DB or Query Error');
         this.logger.getLogger().error(error.message, error, AppointmentService.name + ' createAnAppointment');
         return Promise.reject(rejectionError)
      }
   }

   /**
    * Validates the input parameters for updating an appointment, including the appointment status
    * and reschedule data if applicable.
    * Throws an error if the input is invalid.
    *
    * @param {Appointment} appointment - The appointment to update.
    * @param {AppointmentStatusID} statusId - The new status ID for the appointment.
    * @param {RescheduleAppointmentDto} [rescheduleDto] - Optional DTO containing reschedule data.
    * @returns {Promise<void>} A Promise that resolves if the input is valid and rejects with
    * an error if validation fails.
    */
   public async validateUpdateInput(
      appointment: Appointment,
      statusId: AppointmentStatusID,
      rescheduleDto?: RescheduleAppointmentDto
   ): Promise<void> {
      // Validate appointment status and reschedule input if applicable
      if (rescheduleDto) {
         this.checkAppointmentStatus(appointment.status.id);
         this.validateAppointmentTime(rescheduleDto.validForStartDateTime, rescheduleDto.validForEndDateTime);
         const isConflictAppointment = await this.isAppointmentConflict({
            ...appointment,
            validForStartDateTime: rescheduleDto.validForStartDateTime,
            validForEndDateTime: rescheduleDto.validForEndDateTime
         } as unknown as CreateAppointmentDto);

         if (isConflictAppointment) {
            ErrorUtil.throwError('Appointment conflict detected.', HttpStatus.BAD_REQUEST)
            return;
         }
      } else {
         if (appointment.status.id === AppointmentStatusID.CANCELLED) {
            ErrorUtil.throwError('Cannot update a cancelled or completed appointment.', HttpStatus.BAD_REQUEST)
            return;
         }
      }
   }

   /**
    * Updates the appointment data with the provided status ID and optionally rescheduled date-time.
    * If reschedule data is provided, it updates the appointment's start and end date-time.
    *
    * @param {Appointment} appointment - The appointment to update.
    * @param {any} user - The user performing the update.
    * @param {AppointmentStatusID} statusId - The new status ID for the appointment.
    * @param {RescheduleAppointmentDto} [rescheduleDto] - Optional DTO containing reschedule data.
    * @returns {Appointment} The updated appointment object.
    */
   updateAppointmentData(
      appointment: Appointment,
      user: any,
      statusId: AppointmentStatusID,
      rescheduleDto?: RescheduleAppointmentDto
   ): Appointment {
      const updateData = {
         status: { id: statusId },
         updatedBy: user.sub,
         // if reschedule
         ...(rescheduleDto && {
            validForStartDateTime: rescheduleDto.validForStartDateTime,
            validForEndDateTime: rescheduleDto.validForEndDateTime
         })
      };
      return wrap(appointment).assign(updateData);
   }

   /**
    * Log appointment.
    *
    * @param {any} user - The user who initiated the update.
    * @param {Appointment} updatedAppointment - The updated appointment object.
    * @param {LogAction} action - The action performed on the appointment of type {@link LogAction}.
    * @param {Appointment} [oldAppointment] - Optional parameter representing the old state of the appointment
    * before the update.
    * @returns {Promise<void>} A Promise that resolves when the log entry is persisted.
    */
   async logAppointment(
      user: any,
      updatedAppointment: Appointment,
      action: LogAction,
      oldAppointment?: Appointment
   ): Promise<void>{
      const serializedOldAppointment = oldAppointment
         ? JSON.stringify(MiscUtils.serialize(AppointmentDto, oldAppointment))
         : null;

      const logEntry = new LogEntry(
         updatedAppointment.id,
         'appointment',
         action,
         serializedOldAppointment,
         JSON.stringify(MiscUtils.serialize(AppointmentDto, updatedAppointment)),
         user.sub,
         user.name
      );
      // persist
      await this.entityManager.persistAndFlush(logEntry);
   }

   /**
    * Assigns participant to an appointment and updates its status.
    * @param appointment The appointment to which the participant is being assigned.
    * @param user The user performing the assignment.
    * @param statusId The ID of the status to set for the appointment after assignment.
    * @param createParticipantsDto Data for creating participants.
    * @returns A promise that resolves when the participant is assigned and the appointment is updated.
    * @throws Throws an error if there's a database or query or any kind of error.
    */
   public async assignParticipant(
      appointment: Appointment,
      user: any,
      statusId: AppointmentStatusID,
      createParticipantsDto: CreateParticipantsDto
   ): Promise<any> {
      try{
         // Deep clone the appointment object
         const initialAppointmentCopy = _.cloneDeep(appointment);

         this.checkAppointmentStatus(appointment.status.id);

         // Begin a transaction
         await this.entityManager.transactional(async (transactionalEntityManager) => {

            const participants = createParticipantsDto.participant.map((participantDto: CreateParticipantDto) => {
               return transactionalEntityManager.create(Participant, {
                  ...participantDto,
                  appointmentId: appointment.id
               });
            });

            // Persist all participants in bulk
            await transactionalEntityManager.persistAndFlush(participants);
            const updatedAppointment = wrap(appointment).assign(
               { status: { id: AppointmentStatusID.ASSIGNED }}
            )

            await this.entityManager.persistAndFlush(updatedAppointment);

            // Log appointment update
            await this.logAppointment(user, updatedAppointment, LogAction.UPDATE, initialAppointmentCopy);
         });

      } catch (error){
         const rejectionError = error.customErrMsg ? error : new Error('DB or Query Error');
         this.logger.getLogger().error(error.message, error, AppointmentService.name + ' assignParticipant');
         return Promise.reject(rejectionError)
      }
   }

   /**
    * Retrieves appointments based on filtering criteria specified in the GetAppointmentDto.
    * @param user The user performing the retrieval operation.
    * @param getAppointmentDto DTO containing filtering criteria for retrieving appointments.
    * @returns A Promise resolving to an object containing appointment data and total count.
    * @throws Throws an error if there's a database or query or any kind of error.
    */
   public async getAppointments(user: any, getAppointmentDto: GetAppointmentDto) {
      try{
         const appointmentQueryBuilder: any = this.entityManager
            .qb(Appointment, 'appointment')
            .leftJoinAndSelect('location', 'location')
            .leftJoinAndSelect('participant', 'participant')
            .leftJoinAndSelect('participant.contactMedium', 'contactMedium')
            .leftJoinAndSelect('contactMedium.attribute', 'attribute')
            .leftJoinAndSelect('attachment', 'attachment')
            .leftJoinAndSelect('note', 'note')
            .leftJoinAndSelect('calendarEvent', 'calendarEvent')

         // Apply filtering criteria from the GetAppointmentDto
         this.handleFiltering(appointmentQueryBuilder, getAppointmentDto, user);

         // Count the total number of resulting appointments (excluding limit and offset)
         const count = await appointmentQueryBuilder.clone().count('id', true);

         // Apply limit and offset to the query after the count
         appointmentQueryBuilder.limit(getAppointmentDto.limit);
         appointmentQueryBuilder.offset(getAppointmentDto.offset);

         // Execute the query and retrieve appointments
         const appointment = await appointmentQueryBuilder.getResultList();

         // Return appointments and total count
         return {
            appointment,
            count
         }

      } catch (error){
         const rejectionError = error.customErrMsg ? error : new Error('DB or Query Error');
         this.logger.getLogger().error(error.message, error, AppointmentService.name + ' assignParticipant');
         return Promise.reject(rejectionError)
      }

   }

   /**
    * Handles filtering criteria for appointment retrieval.
    * @param queryBuilder The query builder to which filtering conditions are applied.
    * @param query DTO containing filtering criteria.
    * @param user The user performing the retrieval operation.
    * @throws Throws an error if startDateTimeTo is specified without startDateTimeFrom.
    */
   private handleFiltering(queryBuilder: any, query: GetAppointmentDto, user: any){
      const dateTimeFormat = 'yyyy-MM-DD HH:mm:ss';

      if ('startDateTimeTo' in query && !('startDateTimeFrom' in query)) {
         throw new  UnprocessableEntityException(
            'Please provide a startDateTimeFrom when specifying startDateTimeTo.'
         );
      } else {
         const now: moment.Moment = moment();

         // use when provided or use the default (i.e., filter by today only starting from now to end of today)
         query['dateTimeFrom'] = ('startDateTimeFrom' in query && query.startDateTimeFrom)
            ? moment(query.startDateTimeFrom).startOf('day').format(dateTimeFormat)
            : now.format(dateTimeFormat);

         query['dateTimeTo'] = ('startDateTimeTo' in query && query.startDateTimeTo)
            ? moment(query.startDateTimeTo).endOf('day').format(dateTimeFormat)
            : now.endOf('day').format(dateTimeFormat);
      }

      queryBuilder.andWhere({ 'validForStartDateTime': { $gte: query['dateTimeFrom'] }})
      queryBuilder.andWhere({ 'validForStartDateTime': { $lte: query['dateTimeTo'] } })

      // add conditions only when they are defined in the query
      queryBuilder.andWhere(query.status ? {'appointment.status': query.status} : {});
      queryBuilder.andWhere(query.category ? {'appointment.category': query.category} : {});
      queryBuilder.andWhere(query.locationType ? {'appointment.locationType': query.locationType} : {});

      // Drill down to retrieve only the user Appointment if the auth user is user role
      this.isUserRole(user)
         ? queryBuilder.andWhere({'appointment.creatorId': user.sub})
         : queryBuilder.andWhere(query.creatorId ? {'appointment.creatorId': query.creatorId} : {});


      // order direction
      queryBuilder.orderBy(query.isDescByCreatedAt
         ? { 'appointment.created_at': QueryOrder.DESC }
         : { 'appointment.created_at': QueryOrder.ASC }
      );

   }

   /**
    * Removes a participant from an appointment.
    * @param appointment The appointment from which the participant is being removed.
    * @param participantId The ID of the participant to be removed.
    * @param user The user performing the removal operation.
    * @returns A Promise resolving when the participant is successfully removed.
    * @throws Throws an error if the appointment has less than two participants, if the participant
    * or appointment is not found, or if there's a database or query error.
    */
   public async removeParticipant(appointment: Appointment, participantId: number, user: any){
      try{
         // Deep clone the appointment object
         const initialAppointmentCopy = _.cloneDeep(appointment);

         // check current appointment participants if less than 2
         if (appointment.participant.length < 2 ) {
            ErrorUtil.throwError('Cannot remove participant. An appointment must have at least one participant',
               HttpStatus.NOT_FOUND);
            return;
         }

         // check the status
         this.checkAppointmentStatus(appointment.status.id);

         // find the participant by id
         const participant = await this.entityManager.findOne(
            Participant, {
               id: participantId
            });

         //  return 404 if not found
         if(!participant) {
            if(!appointment) ErrorUtil.throwError('participant not found', HttpStatus.NOT_FOUND);
            return;
         }

         // Remove participant if found
         await this.entityManager.removeAndFlush(participant);

         // then Log appointment update, with reduced participants number
         await this.logAppointment(user, appointment, LogAction.UPDATE, initialAppointmentCopy);

      } catch (error){
         const rejectionError = error.customErrMsg ? error : new Error('DB or Query Error');
         this.logger.getLogger().error(error.message, error, AppointmentService.name + ' assignParticipant');
         return Promise.reject(rejectionError)
      }

   }

}
