import { Test, TestingModule } from '@nestjs/testing';
import { EntityManager } from '@mikro-orm/mysql';
import fs, { promises as fsPromises } from 'fs';
import { HttpStatus } from '@nestjs/common';
import moment from 'moment';
import path from 'path';
import { ErrorUtil } from '../utils/error.util';
import { LoggerService } from '../logger/logger.service';
import { AppointmentService } from './appointment.service';
import { Appointment } from './entities/appointment.entity';
import { appointmentDto, attachmentDto } from '../utils/mock.util';


import { Attachment } from './entities/attachment.entity';
import { CreateAttachmentDto } from './dtos/create-attachment.dto';
import { Note } from './entities/note.entity';

jest.mock('dotenv', () => ({ config: jest.fn() }));
jest.mock('@mikro-orm/mysql');
jest.mock('../utils/error.util');

describe('AppointmentService', () => {
   let service: AppointmentService;
   let entityManagerMock: jest.Mocked<EntityManager>;
   let loggerServiceMock: jest.Mocked<LoggerService>;

   beforeAll(async ()=>{
      jest.resetModules();
      process.env.NODE_ENV = 'test';
      process.env.MIN_APPOINTMENT_TIME_IN_MINS = '10'
   })

   beforeEach(async () => {
      entityManagerMock = {
         transactional: jest.fn(),
         find: jest.fn(),
         findOne: jest.fn(),
         create: jest.fn().mockReturnValueOnce(Math.floor(Math.random() * 10000) + 1),
         persistAndFlush: jest.fn(),
         persist: jest.fn(),
      } as unknown as jest.Mocked<EntityManager>;

      loggerServiceMock = {
         getLogger: jest.fn().mockReturnValue({
            error: jest.fn(),
         }),
      } as unknown as jest.Mocked<LoggerService>;

      const module: TestingModule = await Test.createTestingModule({
         providers: [
            AppointmentService,
            { provide: EntityManager, useValue: entityManagerMock },
            { provide: LoggerService, useValue: loggerServiceMock },
         ],
      }).compile();

      service = module.get<AppointmentService>(AppointmentService);
   });

   afterEach(() => {
      jest.clearAllMocks();
   });

   it('should be defined', () => {
      expect(service).toBeDefined();
   });

   describe('createAnAppointment', () => {
      const user = { name: 'Test User', sub: '123' };
      beforeEach(() => {
         // Mocking the transactional function
         jest.spyOn(entityManagerMock, 'transactional').mockImplementation(async (callback) => {
            // Ensure callback is a function
            if (typeof callback !== 'function') {
               throw new Error('Callback is not a function');
            }
            // Call the callback with entityManagerMock
            return await callback(entityManagerMock);
         });
      });

      it('should create an appointment successfully', async () => {
         // Mocking isAppointmentConflict to return false
         jest.spyOn(service, 'isAppointmentConflict').mockResolvedValue(false);

         // Assert that createAnAppointment resolves without throwing
         await expect(service.createAnAppointment(user, appointmentDto)).resolves.not.toThrow();

         expect(entityManagerMock.create).toHaveBeenCalledWith(Appointment, expect.any(Object));
         expect(entityManagerMock.persistAndFlush).toHaveBeenCalledTimes(1);
         expect(loggerServiceMock.getLogger().error).not.toHaveBeenCalled();
      });

      it('should throw error if any creating appointment prerequisite not met', async () => {
         const validateAppointmentTimeSpy = jest.spyOn(service, 'validateAppointmentTime');

         // Throwing an error when the method is called
         validateAppointmentTimeSpy.mockImplementation(() => {
            throw new Error('Mocked validation error');
         });

         await expect(service.createAnAppointment(user, appointmentDto)).rejects.toThrow();

         expect(entityManagerMock.create).not.toHaveBeenCalled();
         expect(entityManagerMock.persistAndFlush).not.toHaveBeenCalled();
         expect(loggerServiceMock.getLogger().error).toHaveBeenCalledTimes(1);
         validateAppointmentTimeSpy.mockRestore();
      });

   });

   describe('checkAppointmentStatus', () => {
      it('should throw error for invalid status', () => {
         const invalidStatus = 99; // Providing an invalid status

         service.checkAppointmentStatus(invalidStatus)
         expect(ErrorUtil.throwError).toHaveBeenCalledWith(
            'Appointment has been cancelled or completed',
            HttpStatus.BAD_REQUEST
         );
      });

      it('should not throw error for valid status', () => {
         let validStatus = 1; // Providing a valid status
         // Since this is a valid status, it should not call the ErrorUtil.throwError
         service.checkAppointmentStatus(validStatus)
         expect(ErrorUtil.throwError).not.toHaveBeenCalled();
         validStatus = 5
         service.checkAppointmentStatus(validStatus)
         expect(ErrorUtil.throwError).not.toHaveBeenCalled();
      });
   });

   describe('validateAppointmentTime', () => {
      const minAppointmentTimeInMins = 10;

      it('should throw error if start date is in the past', () => {
         const startDate = moment().subtract(2, 'day').toDate();
         const endDate = moment().add(1, 'day').toDate();

         service.validateAppointmentTime(startDate, endDate)
         expect(ErrorUtil.throwError).toHaveBeenCalledWith(
            'Appointment Start date or end date cannot be in the past',
            HttpStatus.BAD_REQUEST
         );
      });

      it('should throw error if end date is before start date', () => {
         const startDate = moment().add(1, 'hour').toDate();
         const endDate = moment().subtract(1, 'hour').toDate();
         service.validateAppointmentTime(startDate, endDate)
         expect(ErrorUtil.throwError).toHaveBeenCalledWith(
            'Appointment end date cannot be before start date',
            HttpStatus.BAD_REQUEST
         );
      });

      it('should throw error if duration is less than minimum appointment time frame', () => {
         const startDate = moment().toDate();
         const endDate = moment().add(minAppointmentTimeInMins - 5, 'minutes').toDate();

         service.validateAppointmentTime(startDate, endDate)
         expect(ErrorUtil.throwError).toHaveBeenCalledWith(
            `Appointment Schedule must be at least ${minAppointmentTimeInMins} minutes`,
            HttpStatus.BAD_REQUEST
         );
      });

      it('should not throw error for valid appointment time', () => {
         const startDate = moment().add(1, 'hour').toDate();
         const endDate = moment().add(2, 'hour').toDate();
         service.validateAppointmentTime(startDate, endDate)
         expect(ErrorUtil.throwError).not.toHaveBeenCalled();
      });
   });

   describe('isAppointmentConflict', () => {

      it('should return true if conflicting appointments exist', async () => {
         // Mocking conflicting appointments
         jest.spyOn(entityManagerMock, 'find').mockResolvedValueOnce([{}])
         const isConflict = await service.isAppointmentConflict(appointmentDto);
         expect(isConflict).toBe(true);
      });

      it('should return false if no conflicting appointments exist', async () => {
         // Mocking no conflicting appointments
         jest.spyOn(entityManagerMock, 'find').mockResolvedValueOnce([]); // i.e no return appointment obj
         const isConflict = await service.isAppointmentConflict(appointmentDto);
         expect(isConflict).toBe(false);
      });

      it('should throw error', async () => {
         // Mocking an error
         entityManagerMock.find.mockRejectedValueOnce(new Error('Test error'));
         await service.isAppointmentConflict(appointmentDto);
         expect(ErrorUtil.throwError).toHaveBeenCalledWith('Unable to check appointment conflict.');
      });
   });

   describe('saveFile', () => {
      const mockFile = { buffer: Buffer.from('Mock file content') };
      const mockExtension = 'txt';

      // Mock Date object to always return a fixed timestamp
      const realDate = Date;
      const mockedDate = new Date('2023-01-01T00:00:00.000Z');
      beforeAll(() => {
         global.Date = jest.fn(() => mockedDate) as any;
         global.Date.now = realDate.now;
      });

      // Mock Math.random() to always return 0.5 (or any other fixed value)
      const realMathRandom = Math.random;
      beforeAll(() => {
         Math.random = jest.fn(() => 0.5);
      });

      afterAll(() => {
         global.Date = realDate;
         Math.random = realMathRandom;
      });

      afterEach(() => {
         jest.clearAllMocks(); // Clear all mocks after each test
      });

      it('should save file successfully', async () => {
         // Mock data directory path
         const mockDataDir = path.resolve(process.cwd(), 'data/appointment-attachment');

         // Mock generated file name with fixed timestamp and a random number
         const timestamp = mockedDate.getTime();
         const randomNumber = Math.floor(Math.random() * 10000);
         const mockFileName = `${timestamp}${randomNumber}.txt`;
         const mockFilePath = path.join(mockDataDir, mockFileName);

         // Mock fsPromises.writeFile to resolve
         jest.spyOn(fsPromises, 'writeFile').mockResolvedValueOnce();
         // Mock fs.existsSync to return false (dataDir does not exist)
         jest.spyOn(fs, 'existsSync').mockReturnValueOnce(false);
         // Mock mkdirSync to do nothing
         jest.spyOn(fs, 'mkdirSync').mockImplementation();

         const result = await service.saveFile(mockFile, mockExtension);

         expect(result).toBe(mockFilePath);
         expect(fsPromises.writeFile).toHaveBeenCalledWith(mockFilePath, mockFile.buffer);
         expect(fs.existsSync).toHaveBeenCalledWith(mockDataDir);
         expect(fs.mkdirSync).toHaveBeenCalledWith(mockDataDir, { recursive: true });
      });

      it('should handle file saving error', async () => {
         // Mock error
         const mockError = new Error('Mocked file saving error');
         // Mock fsPromises.writeFile to reject with error
         jest.spyOn(fsPromises, 'writeFile').mockRejectedValueOnce(mockError);

         await expect(service.saveFile(mockFile, mockExtension)).rejects.toThrow(mockError);
      });

      it('should handle directory creation error', async () => {
         // Mock error
         const mockError = new Error('Mocked directory creation error');
         // Mock fs.existsSync to return false (dataDir does not exist)
         jest.spyOn(fs, 'existsSync').mockReturnValueOnce(false);
         // Mock mkdirSync to throw error
         jest.spyOn(fs, 'mkdirSync').mockImplementation(() => {
            throw mockError;
         });

         await expect(service.saveFile(mockFile, mockExtension)).rejects.toThrow(mockError);
      });
   });

   describe('createAndPersistAttachment', () => {
      it('should create and persist attachment successfully', async () => {
         jest.spyOn(entityManagerMock, 'create').mockReturnValueOnce(attachmentDto);
         // Mock entityManager.persistAndFlush to resolve
         jest.spyOn(entityManagerMock, 'persistAndFlush').mockResolvedValueOnce(attachmentDto as any);

         // Call the method
         const result = await service.createAndPersistAttachment(attachmentDto);

         expect(result).toEqual(attachmentDto);
         expect(entityManagerMock.create).toHaveBeenCalledWith(Attachment, attachmentDto);
         expect(entityManagerMock.persistAndFlush).toHaveBeenCalled();
      });

      it('should handle error during creation and persistence of attachment', async () => {
         // Mock error
         const mockError = new Error('Mocked DB or Query Error');
         jest.spyOn(entityManagerMock, 'persistAndFlush').mockRejectedValueOnce(mockError);

         await service.createAndPersistAttachment({} as CreateAttachmentDto);

         expect(entityManagerMock.create).toHaveBeenCalledWith(Attachment, {});
         expect(loggerServiceMock.getLogger().error).toHaveBeenCalledWith(
            mockError.message, mockError, 'AppointmentService createAndPersistAttachment'
         );
      });
   });

   describe('AppointmentService', () => {
      // Mock data
      const mockAppointmentId = 123;
      const mockUser = {
         sub: 'mockUserId',
         realm_access: {
            roles: ['user', 'admin']
         }
      };
      const mockAppointment = {
         id: mockAppointmentId,
      };

      afterEach(() => {
         jest.clearAllMocks(); // Clear all mocks after each test
      });

      it('should return appointment with valid filtering parameters', async () => {
         // Mock entityManager.findOne to resolve with mockAppointment
         jest.spyOn(entityManagerMock, 'findOne').mockResolvedValueOnce(mockAppointment);

         const result = await service.getAppointment(mockAppointmentId, mockUser);
         expect(result).toEqual(mockAppointment);

         // Assert entityManager.findOne is called with correct arguments
         expect(entityManagerMock.findOne).toHaveBeenCalledWith(
            Appointment,
            {
               id: mockAppointmentId,
               creator_id: mockUser.sub // Assuming creator_id is added to filteringParams for user role
            },
            {
               populate: ['participant', 'participant.contactMedium', 'participant.contactMedium.attribute', 'location',
                  'attachment', 'note', 'calendarEvent']
            }
         );
      });

      it('should throw error when appointment is not found', async () => {
         // Mock entityManager.findOne to resolve with null (appointment not found)
         jest.spyOn(entityManagerMock, 'findOne').mockResolvedValueOnce(null);

         await service.getAppointment(mockAppointmentId, mockUser);

         expect(ErrorUtil.throwError).toHaveBeenCalledWith('appointment not found', 404);
      });

      it('should not add creator_id to filteringParams if user is not in user role', async () => {
         const mockUser = {
            realm_access: {
               roles: ['manager', 'admin']
            }
         };
         // Mock entityManager.findOne to resolve with mockAppointment
         jest.spyOn(entityManagerMock, 'findOne').mockResolvedValueOnce(mockAppointment);

         const result = await service.getAppointment(mockAppointmentId, mockUser);
         expect(result).toEqual(mockAppointment);

         // Assert entityManager.findOne is called with correct arguments, with no creator_id in this case
         expect(entityManagerMock.findOne).toHaveBeenCalledWith(
            Appointment,
            {
               id: mockAppointmentId,
            },
            {
               populate: ['participant', 'participant.contactMedium', 'participant.contactMedium.attribute', 'location',
                  'attachment', 'note', 'calendarEvent']
            }
         );
      });

   });

   describe('createAppointmentNote', () => {
      const mockCreateNotesDto = {
         note: [
            { text: 'Note 1' },
            { text: 'Note 2' },
         ]
      };

      const mockAppointmentId = 123;
      const mockUser = {
         sub: 'mockUserId'
      };

      afterEach(() => {
         jest.clearAllMocks();
      });

      it('should create and persist notes successfully', async () => {
         // Mock entityManager.create and persistAndFlush to resolve with mock notes
         const mockNotes = mockCreateNotesDto.note.map(note => ({
            ...note,
            appointmentId: mockAppointmentId,
            author: mockUser.sub
         }));
         jest.spyOn(entityManagerMock, 'create').mockImplementation(noteData => Promise.resolve(noteData));
         jest.spyOn(entityManagerMock, 'persistAndFlush').mockResolvedValueOnce(mockNotes as any);

         // Call the method
         const result = await service.createAppointmentNote(mockCreateNotesDto, mockAppointmentId, mockUser);

         // Assert the result
         expect(result).toBeInstanceOf(Array)
         expect(result).toHaveLength(2);

         // Assert entityManager.create and persistAndFlush are called with correct arguments
         mockCreateNotesDto.note.forEach((note, _) => {
            expect(entityManagerMock.create).toHaveBeenCalledWith(Note, {
               ...note,
               appointmentId: mockAppointmentId,
               author: mockUser.sub
            });
         });
         expect(entityManagerMock.persistAndFlush).toHaveBeenCalledTimes(mockCreateNotesDto.note.length);
      });

      it('should throw error when error occurs during creation and persistence of notes', async () => {
         // Mock error
         const mockError = new Error('Mocked DB or Query Error');
         jest.spyOn(entityManagerMock, 'create').mockRejectedValueOnce(mockError as never);

         await service.createAppointmentNote(mockCreateNotesDto, mockAppointmentId, mockUser);

         expect(entityManagerMock.create).toHaveBeenCalled();
         expect(entityManagerMock.persistAndFlush).not.toHaveBeenCalled()
         expect(loggerServiceMock.getLogger().error).toHaveBeenCalledWith(
            mockError.message, mockError,'AppointmentService createAppointmentNote');
      });
   });

});
