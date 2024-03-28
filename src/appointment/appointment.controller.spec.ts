import { HttpException, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { EntityManager } from '@mikro-orm/mysql';
import { AppointmentController } from './appointment.controller';
import { AppointmentService } from './appointment.service';
import { LoggerService } from '../logger/logger.service';
import { appointmentDto } from '../utils/mock.util';
import { MiscUtils } from '../utils/misc.util';

describe('AppointmentController', () => {
   let controller: AppointmentController;
   let service: AppointmentService;

   const mockUser = {
      sub: 'mockUserId',
      name: 'mock test user',
      realm_access: {
         roles: ['user']
      }
   };
   const loggerServiceMock: jest.Mocked<LoggerService> = {
      getLogger: jest.fn().mockReturnValue({
         error: jest.fn(),
         log: jest.fn(),
         warn: jest.fn()
      }),
   } as unknown as jest.Mocked<LoggerService>;

   const entityManagerMock: jest.Mocked<EntityManager> = {
      transactional: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      persistAndFlush: jest.fn(),
      persist: jest.fn(),
   } as unknown as jest.Mocked<EntityManager>;

   beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
         controllers: [AppointmentController],
         providers: [
            AppointmentService,
            { provide: EntityManager, useValue: entityManagerMock },
            { provide: LoggerService, useValue: loggerServiceMock },
         ],
      }).compile();

      controller = module.get<AppointmentController>(AppointmentController);
      service = module.get<AppointmentService>(AppointmentService);
   });

   it('should be defined', () => {
      expect(controller).toBeDefined();
   });

   describe('createAnAppointment', () => {
      it('POST createAppointment should return status 200', async () => {
         jest.spyOn(service, 'isAppointmentConflict').mockResolvedValueOnce(false)
         const response = await controller.createAppointment(mockUser, appointmentDto);
         expect(response.statusCode).toEqual(HttpStatus.CREATED);
      });

      it('POST createAppointment should throw due to conflict appointment', async () => {
         jest.spyOn(service, 'isAppointmentConflict').mockResolvedValueOnce(true)
         await expect(controller.createAppointment(mockUser, appointmentDto)).rejects.toThrow();
      });

      it('POST createAppointment should throw due Start date or end date cannot be in the past', async () => {
         const createAppointmentDto = {
            ...appointmentDto,
            validForStartDateTime: new Date(new Date().getTime() - (20 * 60 * 1000)),
            validForEndDateTime: new Date(new Date().getTime() - (30 * 60 * 1000)),
         }
         jest.spyOn(service, 'isAppointmentConflict').mockResolvedValueOnce(false)
         await expect(controller.createAppointment(mockUser, createAppointmentDto)).rejects.toThrow();
      });
   });

   describe('uploadAttachment', () => {
      const appointmentId = 1;
      const file = { originalname: 'test.jpg', mimetype: 'image/jpeg', size: 1000 } as any;
      const user = { sub: 'userId', name: 'testUser' };
      const body = { description: 'Test attachment' };

      it('should upload attachment successfully', async () => {
         const appointmentId = 1;

         const body = { description: 'Test attachment' };

         jest.spyOn(service, 'getAppointment').mockResolvedValueOnce(
           { id: appointmentId, status: { id: 1} as any, sub: 'userId', name: 'testUser'} as any);
         jest.spyOn(service, 'checkAppointmentStatus').mockReturnValueOnce(undefined);
         jest.spyOn(service, 'saveFile').mockResolvedValueOnce('/path/to/test.jpg');
         jest.spyOn(service, 'createAndPersistAttachment').mockResolvedValueOnce(undefined);

         const response = await controller.uploadAttachment(user, appointmentId, file, body);

         expect(response).toEqual({
            status: HttpStatus.OK,
            message: 'OK',
            data: '/path/to/test.jpg',
         });
      });

      it('should handle missing appointment ID', async () => {
         await expect(controller.uploadAttachment(user, null, file, body)).rejects.toThrow(HttpException);
      });

      it('should handle invalid file', async () => {
         // Invalid file size
         const invalidFile = { originalname: 'test.jpg', mimetype: 'image/jpeg', size: 10000000 } as any;
         await expect(controller.uploadAttachment(user, appointmentId, invalidFile, body))
            .rejects.toThrow(HttpException);
      });

      it('should handle unauthorized access', async () => {
         const nullUser = null; // Unauthenticated user
         await expect(controller.uploadAttachment(nullUser, appointmentId, file, body)).rejects.toThrow(HttpException);
      });
   });

   describe('getAppointments', () => {
      const appointmentId = 1;
      const user = { sub: 'userId', name: 'testUser' };
      it('should get appointment successfully', async () => {
         const appointmentData = {
            ...appointmentDto,
            status: { id: 1},
            id: appointmentId,
            createdId: user.sub,
         }
         jest.spyOn(service, 'getAppointment').mockResolvedValueOnce(appointmentDto as any);
         jest.spyOn(MiscUtils, 'serialize').mockReturnValueOnce(appointmentData);

         const response = await controller.getAppointments(user, appointmentId);

         expect(response).toEqual({
            status: HttpStatus.OK,
            message: 'OK',
            data: appointmentData,
         });
      });

      it('should handle missing appointment ID', async () => {
         const user = { sub: 'userId', name: 'testUser' };
         await expect(controller.getAppointments(user, null)).rejects.toThrow(HttpException);
      });
   });

   describe('createAppointmentNote', () => {
      const appointmentId = 1;
      const user = { sub: 'userId', name: 'testUser' };
      const mockCreateNotesDto = {
         note: [
            { text: 'Note 1' },
            { text: 'Note 2' },
         ]
      };

      it('should create appointment note successfully', async () => {
         jest.spyOn(service, 'getAppointment').mockResolvedValueOnce(
           { id: appointmentId, status: { id: 1} as any, sub: 'userId', name: 'testUser'} as any);
         jest.spyOn(service, 'checkAppointmentStatus').mockReturnValueOnce(undefined);
         jest.spyOn(service, 'createAppointmentNote').mockResolvedValueOnce(undefined);

         const response = await controller.createAppointmentNote(user, appointmentId,  mockCreateNotesDto);

         expect(response).toEqual({
            statusCode: HttpStatus.OK,
            message: 'OK',
         });
      });

      it('should handle missing appointment ID', async () => {
         await expect(controller.createAppointmentNote(user, null, mockCreateNotesDto)).rejects.toThrow(HttpException);
      });
   });

});
