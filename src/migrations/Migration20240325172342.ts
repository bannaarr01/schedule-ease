import { Migration } from '@mikro-orm/migrations';

export class Migration20240325172342 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table `log_entry` modify `old_value` varchar(1000) default null;');
  }

  async down(): Promise<void> {
    this.addSql('alter table `log_entry` modify `old_value` varchar(255) default null;');
  }

}
