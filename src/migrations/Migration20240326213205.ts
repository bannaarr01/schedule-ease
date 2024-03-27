import { Migration } from '@mikro-orm/migrations';

export class Migration20240326213205 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table `appointment` drop foreign key `appointment_status_id_foreign`;');

    this.addSql('alter table `appointment` modify `status_id` int unsigned null;');
    this.addSql('alter table `appointment` add constraint `appointment_status_id_foreign` foreign key (`status_id`) references `appointment_status` (`id`) on update cascade on delete cascade;');
  }

  async down(): Promise<void> {
    this.addSql('alter table `appointment` drop foreign key `appointment_status_id_foreign`;');

    this.addSql('alter table `appointment` modify `status_id` int unsigned not null;');
    this.addSql('alter table `appointment` add constraint `appointment_status_id_foreign` foreign key (`status_id`) references `appointment_status` (`id`) on update cascade;');
  }

}
