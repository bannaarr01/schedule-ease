import { Migration } from '@mikro-orm/migrations';

export class Migration20240326214725 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table `appointment` modify `status_id` int unsigned null;');
  }

  async down(): Promise<void> {
    this.addSql('alter table `appointment` modify `status_id` int unsigned not null;');
  }

}
