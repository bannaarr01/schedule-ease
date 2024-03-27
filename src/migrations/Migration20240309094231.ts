import { Migration } from '@mikro-orm/migrations';

export class Migration20240309094231 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table `appointment` drop foreign key `appointment_status_id_id_foreign`;');

    this.addSql('alter table `appointment` drop index `appointment_status_id_id_index`;');

    this.addSql('alter table `appointment` change `status_id_id` `status_id` int unsigned not null;');
    this.addSql('alter table `appointment` add constraint `appointment_status_id_foreign` foreign key (`status_id`) references `appointment_status` (`id`) on update cascade;');
    this.addSql('alter table `appointment` add index `appointment_status_id_index`(`status_id`);');
  }

  async down(): Promise<void> {
    this.addSql('alter table `appointment` drop foreign key `appointment_status_id_foreign`;');

    this.addSql('alter table `appointment` drop index `appointment_status_id_index`;');

    this.addSql('alter table `appointment` change `status_id` `status_id_id` int unsigned not null;');
    this.addSql('alter table `appointment` add constraint `appointment_status_id_id_foreign` foreign key (`status_id_id`) references `appointment_status` (`id`) on update cascade;');
    this.addSql('alter table `appointment` add index `appointment_status_id_id_index`(`status_id_id`);');
  }

}
