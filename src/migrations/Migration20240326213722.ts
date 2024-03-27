import { Migration } from '@mikro-orm/migrations';

export class Migration20240326213722 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table `appointment` modify `status_id` int unsigned not null;');
  }

  async down(): Promise<void> {
    this.addSql('alter table `appointment` modify `status_id` int unsigned null;');
  }

}
