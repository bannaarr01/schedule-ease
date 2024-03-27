import {
   Get,
   Put,
   Body,
   Post,
   Param,
   Controller,
   HttpStatus,
   UploadedFile,
   HttpException,
   ParseFilePipe,
   UseInterceptors,
   MaxFileSizeValidator,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { AuthenticatedUser, Roles } from 'nest-keycloak-connect';
import { FileInterceptor } from '@nestjs/platform-express';
import { AppointmentService } from './appointment.service';
import { CreateAppointmentDto } from './dtos/create-appointment.dto';
import { UploadAttachmentDto } from './dtos/upload-attachment.dto';
import { ApiOperationAndResponses } from '../utils/api.util';
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
         this.logger.getLogger().error(error.message || error.customErrMsg, error,
            AppointmentController.name + ' createAppointment');
         throw new HttpException(error.customErrMsg || error.message
        || 'Internal Server Error',error.statusCode || HttpStatus.INTERNAL_SERVER_ERROR);
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
        this.logger.getLogger().error(error.message || error.customErrMsg, error,
           AppointmentController.name + ' uploadAttachment');
        throw new HttpException(error.customErrMsg || error.message
           || 'Internal Server Error', error.statusCode || HttpStatus.INTERNAL_SERVER_ERROR);
     }
  }

  @Put('notes/:appointmentId')
  @Roles({ roles: ['realm:creator', 'realm:user', 'realm:manager']})
  @ApiOperationAndResponses({
     summary: 'Create a new appointment',
     responseDescriptions: {
        [HttpStatus.CREATED]: 'Returns the newly created appointment.'
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
        this.logger.getLogger().error(error.message || error.customErrMsg, error,
           AppointmentController.name + ' createAppointmentNote');
        throw new HttpException(error.customErrMsg || error.message
        || 'Internal Server Error',error.statusCode || HttpStatus.INTERNAL_SERVER_ERROR);
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
  public async getAppointments(@AuthenticatedUser() user: any, @Param('appointmentId') appointmentId: number){
     try {
        const appointment = await this.appointmentService.getAppointment(appointmentId, user);
        const serializedAppointment = MiscUtils.serialize(AppointmentDto, appointment);

        return {
           status: HttpStatus.OK,
           message: 'OK',
           data: serializedAppointment
        };
     } catch (error) {
        this.logger.getLogger().error(error.message || error.customErrMsg, error,
           AppointmentController.name + ' getAppointments');
        throw new HttpException(error.customErrMsg || error.message
        || 'Internal Server Error',error.statusCode || HttpStatus.INTERNAL_SERVER_ERROR);
     }
  }
}
