import { Migration } from '@mikro-orm/migrations';

export class Migration20240323005245 extends Migration {

   async up(): Promise<void> {
      this.addSql('alter table `appointment` add unique `appointment_location_id_unique`(`location_id`);');
   }

   async down(): Promise<void> {
      this.addSql('alter table `appointment` drop index `appointment_location_id_unique`;');

      this.addSql('alter table `appointment` add index `appointment_location_id_index`(`location_id`);');
   }

}
