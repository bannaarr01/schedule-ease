import { Migration } from '@mikro-orm/migrations';

export class Migration20240325170605 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table `log_entry` modify `entity_type` varchar(255) not null;');
  }

  async down(): Promise<void> {
    this.addSql('alter table `log_entry` modify `entity_type` int not null;');
  }

}
