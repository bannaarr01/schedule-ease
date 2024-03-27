import { Migration } from '@mikro-orm/migrations';

export class Migration20240323011450 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table `appointment` add `updated_by` varchar(255) null;');
  }

  async down(): Promise<void> {
    this.addSql('alter table `appointment` drop column `updated_by`;');
  }

}
