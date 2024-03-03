import { Migration } from '@mikro-orm/migrations';

export class Migration20240303155807 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table `appointment` modify `category` varchar(255) not null;');
  }

  async down(): Promise<void> {
    this.addSql('alter table `appointment` modify `category` varchar(255) null;');
  }

}
