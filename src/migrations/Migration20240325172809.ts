import { Migration } from '@mikro-orm/migrations';

export class Migration20240325172809 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table `log_entry` modify `old_value` varchar(2500) default null, modify `new_value` varchar(2500) default null;');
  }

  async down(): Promise<void> {
    this.addSql('alter table `log_entry` modify `old_value` varchar(1000) default null, modify `new_value` varchar(1000) default null;');
  }

}
