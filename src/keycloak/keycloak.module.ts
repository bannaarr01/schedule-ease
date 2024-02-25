import { Module } from '@nestjs/common';
import { KeycloakService } from './keycloak.service';
import { KeycloakController } from './keycloak.controller';
import { HttpModule } from '@nestjs/axios';
import { LoggerService } from '../logger/logger.service';

@Module({
   imports: [HttpModule],
   controllers: [KeycloakController],
   providers: [KeycloakService, LoggerService],
})
export class KeycloakModule {}
