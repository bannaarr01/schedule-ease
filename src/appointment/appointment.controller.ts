import { Body, Controller, HttpException, HttpStatus, Post } from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { LoggerService } from '../logger/logger.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ApiOperationAndResponses } from '../utils/utils';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { AuthenticatedUser, Roles } from 'nest-keycloak-connect';

@Controller('appointment')
@ApiTags('Appointment')
@ApiBearerAuth()
export class AppointmentController {
   constructor(
    private readonly appointmentService: AppointmentService,
    private readonly logger: LoggerService
   ) {}

  @Post()
  @Roles({ roles: ['realm:creator']})
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
}
