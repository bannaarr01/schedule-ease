import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { AuthModule } from './auth/auth.module';
import { KeycloakModule } from './keycloak/keycloak.module';
import { AppointmentModule } from './appointment/appointment.module';
import { LoggerService } from './logger/logger.service';
import { DbMigrationService } from './db-migration/db-migration.service';
import { DbMigrationModule } from './db-migration/db-migration.module';
import { SeedService } from './seed/seed.service';
import { SeedModule } from './seed/seed.module';

@Module({
   imports: [
      MikroOrmModule.forRoot(),
      AuthModule.forRoot(),
      KeycloakModule,
      AppointmentModule,
      DbMigrationModule,
      SeedModule
   ],
   controllers: [AppController],
   providers: [AppService, LoggerService, DbMigrationService, SeedService],
})
export class AppModule {}
