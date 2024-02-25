import { TsMorphMetadataProvider } from '@mikro-orm/reflection';
import { Logger } from '@nestjs/common';
import { defineConfig } from '@mikro-orm/mysql'

const logger = new Logger('MikroORM');

/**
 * Configuration object for database connection and migrations setup.
 * @remarks
 * This configuration object is used to define database connection parameters,
 * entity and migration paths, and other related settings.
 *
 * @returns {import('mikro-orm').MikroORMOptions} The MikroORM configuration object.
 */
export default defineConfig({
   dbName: process.env.DB_NAME,             // The name of the database
   user: process.env.DB_USER,               // The username for database authentication
   password: process.env.DB_PASS,           // The password for database authentication
   host: process.env.DB_HOST,               // The hostname of the database server
   port: parseInt(process.env.DB_PORT!),    // The port number of the database server
   metadataProvider: TsMorphMetadataProvider,  // Metadata provider for entity metadata
   // cache: { enabled: false },            // (Optional) Configuration for caching
   logger: logger.log.bind(logger),        // The logger function for logging messages
   debug: true,                             // Enable debug mode
   entities: ['./dist/**/*.entity.js'],     // File paths for entity definitions (compiled)
   entitiesTs: ['src/**/*.entity.ts'],      // File paths for entity definitions (source)
   migrations: {
      path: 'dist/migrations',             // Path to the migration files (compiled)
      pathTs: 'src/migrations',            // Path to the migration files (source)
      tableName: 'mikro_orm_migrations',   // Name of the migrations table in the database
      glob: '!(*.d).{js,ts}',              // Glob pattern to match migration files
      transactional: true,                 // Whether migrations should run within transactions
      disableForeignKeys: true,            // Whether to disable foreign key checks during migrations
      allOrNothing: true,                  // Whether to roll back all migrations in case of failure
      dropTables: true,                    // Whether to drop all tables before running migrations
      safe: false,                         // Whether to perform safe migrations (dry-run)
      snapshot: true,                      // Whether to create a snapshot of the database before migration
      emit: 'ts',                          // Language to emit (js or ts)
   },
});
