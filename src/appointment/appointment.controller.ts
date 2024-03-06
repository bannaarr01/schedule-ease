import {
   Body,
   Controller,
   HttpException,
   HttpStatus,
   MaxFileSizeValidator, ParseFilePipe,
   Post,
   UploadedFile,
   UseInterceptors
} from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { LoggerService } from '../logger/logger.service';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { ApiOperationAndResponses } from '../utils/utils';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { AuthenticatedUser, Roles } from 'nest-keycloak-connect';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadAttachmentDto } from './dto/upload-attachment.dto';

@Controller('appointment')
@ApiTags('Appointment')
@ApiBearerAuth()
export class AppointmentController {
   constructor(
    private readonly appointmentService: AppointmentService,
    private readonly logger: LoggerService
   ) {}

  @Post()
  @Roles({ roles: ['realm:creator', 'realm:manager']})
  @ApiOperationAndResponses({
     summary: 'Create a new appointment',
     description: 'This endpoint allows users to create a new appointment.',
     responseDescriptions: {
        [HttpStatus.CREATED]: 'Returns the newly created appointment.'
     }
  })
   public async createAppointment(@AuthenticatedUser() user: any, @Body() createAppointmentDto: CreateAppointmentDto){
      try {
         return await this.appointmentService.createAnAppointment(user, createAppointmentDto);
      } catch (error) {
         this.logger.getLogger().error(error.message || error.customErrMsg, error, 
            AppointmentController.name + ' createAppointment');
         throw new HttpException(error.customErrMsg || error.message
        || 'Internal Server Error',error.statusCode || HttpStatus.INTERNAL_SERVER_ERROR);
      }
   }

  @Post('uploadAttachment')
  @Roles({ roles: ['realm:creator', 'realm:manager']})
  @ApiOperationAndResponses({
     summary: 'Upload appointment attachment/file',
     description: 'This endpoint allows users to upload appointment attachment/file.',
     responseDescriptions: {
        [HttpStatus.CREATED]: 'Returns the path of the uploaded attachment/file.'
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
        const appointment = await this.appointmentService.getAppointment(+body.appointmentId);
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

}
