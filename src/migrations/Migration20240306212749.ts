import { Migration } from '@mikro-orm/migrations';

export class Migration20240306212749 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table `attachment` drop column `content`;');

    this.addSql('alter table `attachment` add `uploaded_by_id` varchar(255) not null, add `uploaded_by_name` varchar(255) not null;');
  }

  async down(): Promise<void> {
    this.addSql('alter table `attachment` drop column `uploaded_by_id`;');
    this.addSql('alter table `attachment` drop column `uploaded_by_name`;');

    this.addSql('alter table `attachment` add `content` varchar(255) null;');
  }

}
