import { Module } from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { AppointmentController } from './appointment.controller';
import { LoggerService } from '../logger/logger.service';

@Module({
   controllers: [AppointmentController],
   providers: [AppointmentService, LoggerService],
})
export class AppointmentModule {}
