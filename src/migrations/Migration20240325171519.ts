import { Migration } from '@mikro-orm/migrations';

export class Migration20240325171519 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table `log_entry` modify `old_value` varchar(255) null default null, modify `new_value` varchar(255) null default null;');
  }

  async down(): Promise<void> {
    this.addSql('alter table `log_entry` modify `old_value` varchar(255) not null, modify `new_value` varchar(255) not null;');
  }

}
