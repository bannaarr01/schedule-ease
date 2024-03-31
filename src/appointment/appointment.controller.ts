import {
   Put,
   Get,
   Body,
   Post,
   Patch,
   Param,
   Query,
   Controller,
   HttpStatus,
   UploadedFile,
   ParseFilePipe,
   HttpException,
   UseInterceptors,
   MaxFileSizeValidator,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { RescheduleAppointmentDto } from './dtos/reschedule-appointment.dto';
import { CreateParticipantsDto } from './dtos/create-participant.dto';
import { CreateAppointmentDto } from './dtos/create-appointment.dto';
import { UploadAttachmentDto } from './dtos/upload-attachment.dto';
import { AppointmentStatusID } from './enums/appointment-status';
import { AuthenticatedUser, Roles } from 'nest-keycloak-connect';
import { GetAppointmentDto } from './dtos/get-appointment.dto';
import { ApiOperationAndResponses } from '../utils/api.util';
import { FileInterceptor } from '@nestjs/platform-express';
import { AppointmentService } from './appointment.service';
import { LoggerService } from '../logger/logger.service';
import { AppointmentDto } from './dtos/appointment.dto';
import { CreateNotesDto } from './dtos/create-note.dto';
import { MiscUtils } from '../utils/misc.util';

@Controller('appointments')
@ApiTags('Appointments')
@ApiBearerAuth()
export class AppointmentController {
   constructor(
    private readonly appointmentService: AppointmentService,
    private readonly logger: LoggerService
   ) {}

  @Post()
  @Roles({ roles: ['realm:creator', 'realm:user', 'realm:manager']})
  @ApiOperationAndResponses({
     summary: 'Create a new appointment',
     responseDescriptions: {
        [HttpStatus.CREATED]: 'Returns the newly created appointment.'
     }
  })
   public async createAppointment(
     @AuthenticatedUser() user: any,
     @Body() createAppointmentDto: CreateAppointmentDto
   ): Promise<any>{
      try {
         const appointment = await this.appointmentService.createAnAppointment(user, createAppointmentDto);

         return {
            statusCode: HttpStatus.CREATED,
            message: 'OK',
            data: appointment
         };
      } catch (error) {
         this.handleError(error, ' createAppointment');
      }
   }

  @Put('attachments/:appointmentId')
  @Roles({ roles: ['realm:creator', 'realm:user', 'realm:manager']})
  @ApiOperationAndResponses({
     summary: 'Upload appointment attachment/file',
     responseDescriptions: {
        [HttpStatus.OK]: 'Returns the path of the uploaded attachment/file.'
     }
  })
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
     description: 'Appointment Attachment',
     type: UploadAttachmentDto,
  })
  public async uploadAttachment(
      @AuthenticatedUser() user: any,
      @Param('appointmentId') appointmentId: number,
      @UploadedFile(
         new ParseFilePipe({
            validators: [
               new MaxFileSizeValidator({ maxSize: 5242880})
            ],
            errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY
         })
      ) file: Express.Multer.File,
      @Body() body: any
  ) : Promise <any> {
     try{
        const appointment = await this.appointmentService.getAppointment(appointmentId, user);
        this.appointmentService.checkAppointmentStatus(appointment.status.id);
        // Matches the last occurrence of '.' followed by characters other than '.' till the end of the string
        const fileExt = file.originalname.match(/\.([^.]+)$/)[1];
        const savedFilePath = await this.appointmentService.saveFile(file, fileExt);
        await this.appointmentService.createAndPersistAttachment({
           appointmentId: appointment.id,
           attachmentType: fileExt,
           originalName: file.originalname,
           mimeType: file.mimetype,
           size: file.size,
           path: savedFilePath,
           uploadedById: user.sub,
           uploadedByName: user.name,
           description: body.description || 'Appointment Attachment'
        });

        return {
           status: HttpStatus.OK,
           message: 'OK',
           data: savedFilePath
        };
        
     } catch (error) {
        this.handleError(error, ' uploadAttachment')
     }
  }

  @Put('notes/:appointmentId')
  @Roles({ roles: ['realm:creator', 'realm:user', 'realm:manager']})
  @ApiOperationAndResponses({
     summary: 'Add notes to appointment',
     responseDescriptions: {
        [HttpStatus.OK]: 'Returns ok.'
     }
  })
  public async createAppointmentNote(
    @AuthenticatedUser() user: any,
    @Param('appointmentId') appointmentId: number,
    @Body() createNotesDto: CreateNotesDto): Promise<any>{
     try {
        const appointment = await this.appointmentService.getAppointment(appointmentId, user);
        this.appointmentService.checkAppointmentStatus(appointment.status.id);

        await this.appointmentService.createAppointmentNote(createNotesDto, appointment.id, user);

        return {
           statusCode: HttpStatus.OK,
           message: 'OK',
        };
     } catch (error) {
        this.handleError(error, ' createAppointmentNote');
     }
  }

  @Put('participants/:appointmentId')
  @Roles({ roles: ['realm:creator', 'realm:user', 'realm:manager']})
  @ApiOperationAndResponses({
     summary: 'Assign participant to an appointment',
     responseDescriptions: {
        [HttpStatus.OK]: 'Returns ok'
     }
  })
  public async assignParticipants(
    @AuthenticatedUser() user: any,
    @Param('appointmentId') appointmentId: number,
    @Body() createParticipantsDto: CreateParticipantsDto): Promise<any>{
     try {
        const appointment = await this.appointmentService.getAppointment(appointmentId, user);
        await this.appointmentService.assignParticipant(
           appointment,
           user,
           AppointmentStatusID.ASSIGNED,
           createParticipantsDto
        );

        return {
           status: HttpStatus.OK,
           message: 'OK'
        };
     } catch (error) {
        this.handleError(error, ' assignParticipants');
     }
  }

  @Get('/:appointmentId')
  @Roles({ roles: ['realm:creator', 'realm:user', 'realm:manager']})
  @ApiOperationAndResponses({
     summary: 'Get appointment By ID',
     description: 'Allow to retrieve appointment Based on appointment ID',
     responseDescriptions: {
        [HttpStatus.OK]: 'Returns an appointment.'
     }
  })
  public async getAppointment(@AuthenticatedUser() user: any, @Param('appointmentId') appointmentId: number){
     try {
        const appointment = await this.appointmentService.getAppointment(appointmentId, user);
        const serializedAppointment = MiscUtils.serialize(AppointmentDto, appointment);

        return {
           status: HttpStatus.OK,
           message: 'OK',
           data: serializedAppointment
        };
     } catch (error) {
        this.handleError(error, ' getAppointment');
     }
  }

  @Get()
  @Roles({ roles: ['realm:creator', 'realm:user', 'realm:manager']})
  @ApiOperationAndResponses({
     summary: 'Get appointments by query',
     description: 'Allow to retrieve appointments Based on Query Params',
     responseDescriptions: {
        [HttpStatus.OK]: 'Returns appointments.'
     }
  })
  public async getAppointments(@AuthenticatedUser() user: any, @Query() getAppointmentDto: GetAppointmentDto){
     try {
        const { appointment, count } = await this.appointmentService.getAppointments(user, getAppointmentDto);

        return {
           status: HttpStatus.OK,
           message: 'OK',
           data: appointment,
           count
        };
     } catch (error) {
        this.handleError(error, ' getAppointments');
     }
  }

  @Patch('cancel/:appointmentId')
  @Roles({ roles: ['realm:creator', 'realm:user', 'realm:manager']})
  @ApiOperationAndResponses({
     summary: 'Cancel an appointment',
     responseDescriptions: {
        [HttpStatus.OK]: 'Returns status ok.'
     }
  })
  public async cancelAppointment(
    @AuthenticatedUser() user: any,
    @Param('appointmentId') appointmentId: number,
  ): Promise<any> {
     try {
        const appointment = await this.appointmentService.getAppointment(appointmentId, user);
        await this.appointmentService.updateAppointment(appointment, user, AppointmentStatusID.CANCELLED);

        return {
           status: HttpStatus.OK,
           message: 'OK'
        };
     } catch (error) {
        this.handleError(error, ' cancelAppointment');
     }
  }

  @Patch('reschedule/:appointmentId')
  @Roles({ roles: ['realm:creator', 'realm:user', 'realm:manager']})
  @ApiOperationAndResponses({
     summary: 'Reschedule an appointment',
     responseDescriptions: {
        [HttpStatus.OK]: 'Returns ok.'
     }
  })
  public async rescheduleAppointment(
    @AuthenticatedUser() user: any,
    @Param('appointmentId') appointmentId: number,
    @Body() rescheduleDto: RescheduleAppointmentDto,
  ): Promise<any> {
     try {
        const appointment = await this.appointmentService.getAppointment(appointmentId, user);
        await this.appointmentService.updateAppointment(
           appointment,
           user,
           AppointmentStatusID.RESCHEDULED,
           rescheduleDto
        );

        return {
           status: HttpStatus.OK,
           message: 'OK'
        };
     } catch (error) {
        this.handleError(error, ' rescheduleAppointment');
     }
  }

  @Patch('participants/:appointmentId/:participantId')
  @Roles({ roles: ['realm:creator', 'realm:user', 'realm:manager']})
  @ApiOperationAndResponses({
     summary: 'Remove participant from an appointment',
     responseDescriptions: {
        [HttpStatus.OK]: 'Returns status ok.'
     }
  })
  public async removeAppointmentParticipant(
    @AuthenticatedUser() user: any,
    @Param('appointmentId') appointmentId: number,
    @Param('participantId') participantId: number,
  ): Promise<any> {
     try {
        const appointment = await this.appointmentService.getAppointment(appointmentId, user);
        await this.appointmentService.removeParticipant(appointment, participantId, user);

        return {
           status: HttpStatus.OK,
           message: 'OK'
        };
     } catch (error) {
        this.handleError(error, ' removeAppointmentParticipant');
     }
  }

  /**
   * Handles and logs errors that occur within the appointment controller.
   * @param error The error object to be handled.
   * @param context A string indicating the context in which the error occurred.
   * @throws Throws an HttpException with an appropriate status code and error message
   * based on the provided error object.
   */
  public handleError(error: any, context: string): void {
     this.logger.getLogger().error(error.message || error.customErrMsg, error,
        AppointmentController.name + context);
     throw new HttpException(error.customErrMsg || error.message
      || 'Internal Server Error',error.statusCode || HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
