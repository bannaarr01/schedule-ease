/**
 * Imports and configures authentication guards for NestJS applications using Keycloak.
 * This module provides functionality for integrating Keycloak authentication into NestJS applications.
 * It includes guards for authentication, resource protection, and role-based access control.
 * Environment variables required for Keycloak configuration should be loaded via dotenv before importing this module.
 * This module can also be extended/enhance to use multi-authentication other than keycloak
 */
import * as dotenv from 'dotenv';
import { APP_GUARD } from '@nestjs/core';
import { CanActivate, DynamicModule, Module, Type } from '@nestjs/common';
import {
   AuthGuard,
   KeycloakConnectModule,
   ResourceGuard,
   RoleGuard,
   TokenValidation
} from 'nest-keycloak-connect';
import * as process from 'process';

dotenv.config();

// type for Guard classes
type GuardType = Type<CanActivate>;

@Module({})
export class AuthModule {
   /**
   * Configures guards and imports for dynamic module creation.
   * @param loadModule The module to be loaded dynamically.
   * @param guards An array of guard classes to be provided.
   * @returns A dynamically configured module.
   */
   private static configureGuardsAndImports(loadModule: any, guards: GuardType[]): DynamicModule {
      return {
         module: AuthModule,
         imports: [loadModule],
         providers: guards.map((guard) => ({
            provide: APP_GUARD,
            useClass: guard,
         })),
      };
   }

   /**
   * Configures Keycloak authentication for the application.
   * @returns A dynamically configured module with Keycloak authentication enabled.
   */
   static keycloakAuth(): DynamicModule {
      return AuthModule.configureGuardsAndImports(
         KeycloakConnectModule.register({
            authServerUrl: `${process.env.KEYCLOAK_BASE_URL}`,
            realm: process.env.KEYCLOAK_REALM,
            clientId: process.env.KEYCLOAK_CLIENTID,
            resource: `${process.env.KEYCLOAK_CLIENTID}`,
            bearerOnly: true,
            public: false,
            realmPublicKey: process.env.KEYCLOAK_PUBLIC_KEY,
            secret: process.env.KEYCLOAK_CLIENT_SECRET,
            tokenValidation: TokenValidation.OFFLINE,
            logLevels: ['error']
         }),
         [AuthGuard, ResourceGuard, RoleGuard],
      );
   }

   /**
   * Provides the root module configuration.
   * @returns A dynamically configured module with Keycloak authentication enabled.
   */
   static forRoot(): DynamicModule {
      return AuthModule.keycloakAuth();
   }
}