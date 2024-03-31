import { Module } from '@nestjs/common';
import { AlertStreamService } from './alert-stream.service';
import { HttpModule } from '@nestjs/axios';

@Module({
   imports: [HttpModule],
   providers: [AlertStreamService],
   exports: [AlertStreamService]
})
export class AlertStreamModule {}
