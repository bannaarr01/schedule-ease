import { Module } from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { AppointmentController } from './appointment.controller';
import { LoggerService } from '../logger/logger.service';
import { AlertStreamService } from '../alert-stream/alert-stream.service';

@Module({
   controllers: [AppointmentController],
   providers: [
      AppointmentService,
      AlertStreamService,
      LoggerService,
   ],
})
export class AppointmentModule {}
