import { Migration } from '@mikro-orm/migrations';

export class Migration20240322163555 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table `appointment` add `updated_by` varchar(255) not null;');
  }

  async down(): Promise<void> {
    this.addSql('alter table `appointment` drop column `updated_by`;');
  }

}
