import { Migration } from '@mikro-orm/migrations';

export class Migration20240322162523 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table `appointment` modify `location_type` varchar(255) not null;');
  }

  async down(): Promise<void> {
    this.addSql('alter table `appointment` modify `location_type` varchar(255) null;');
  }

}
