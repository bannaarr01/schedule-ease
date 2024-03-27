import { Migration } from '@mikro-orm/migrations';

export class Migration20240327043710 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table `note` modify `text` varchar(1000);');
  }

  async down(): Promise<void> {
    this.addSql('alter table `note` modify `text` varchar(255);');
  }

}
