import { Module } from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { AppointmentController } from './appointment.controller';

@Module({
  controllers: [AppointmentController],
  providers: [AppointmentService],
})
export class AppointmentModule {}
