import { Migration } from '@mikro-orm/migrations';

export class Migration20240303160237 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table `appointment` add `creator_id` varchar(255) not null, add `created_by` varchar(255) not null;');
  }

  async down(): Promise<void> {
    this.addSql('alter table `appointment` drop column `creator_id`;');
    this.addSql('alter table `appointment` drop column `created_by`;');
  }

}
