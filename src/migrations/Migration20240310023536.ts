import { Migration } from '@mikro-orm/migrations';

export class Migration20240310023536 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table `appointment_log` drop column `updated_by_id`;');
    this.addSql('alter table `appointment_log` drop column `updated_by_name`;');

    this.addSql('alter table `appointment_log` add `created_by_id` varchar(255) not null, add `created_by_name` varchar(255) not null;');
  }

  async down(): Promise<void> {
    this.addSql('alter table `appointment_log` drop column `created_by_id`;');
    this.addSql('alter table `appointment_log` drop column `created_by_name`;');

    this.addSql('alter table `appointment_log` add `updated_by_id` varchar(255) not null, add `updated_by_name` varchar(255) not null;');
  }

}
