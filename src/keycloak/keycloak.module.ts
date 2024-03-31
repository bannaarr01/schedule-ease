import { Module } from '@nestjs/common';
import { KeycloakService } from './keycloak.service';
import { KeycloakController } from './keycloak.controller';
import { HttpModule } from '@nestjs/axios';
import { LoggerService } from '../logger/logger.service';
import { AlertStreamModule } from '../alert-stream/alert-stream.module';

@Module({
   imports: [HttpModule, AlertStreamModule],
   controllers: [KeycloakController],
   providers: [KeycloakService, LoggerService],
   exports: [KeycloakService]
})
export class KeycloakModule {}
