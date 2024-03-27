import { Migration } from '@mikro-orm/migrations';

export class Migration20240322164745 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table `location` drop foreign key `location_appointment_id_foreign`;');

    this.addSql('alter table `location` drop index `location_appointment_id_index`;');
    this.addSql('alter table `location` drop column `appointment_id`;');

    this.addSql('alter table `location` modify `street_nr` varchar(255) null, modify `street_name` varchar(255) null, modify `post_code` varchar(255) null, modify `city` varchar(255) null, modify `state_or_province` varchar(255) null, modify `country` varchar(255) null;');

    this.addSql('alter table `appointment` add `location_id` int unsigned null;');
    this.addSql('alter table `appointment` add constraint `appointment_location_id_foreign` foreign key (`location_id`) references `location` (`id`) on update cascade on delete set null;');
    this.addSql('alter table `appointment` add unique `appointment_location_id_unique`(`location_id`);');
  }

  async down(): Promise<void> {
    this.addSql('alter table `appointment` drop foreign key `appointment_location_id_foreign`;');

    this.addSql('alter table `appointment` drop index `appointment_location_id_unique`;');
    this.addSql('alter table `appointment` drop column `location_id`;');

    this.addSql('alter table `location` add `appointment_id` int unsigned not null;');
    this.addSql('alter table `location` modify `street_nr` varchar(255) not null, modify `street_name` varchar(255) not null, modify `post_code` varchar(255) not null, modify `city` varchar(255) not null, modify `state_or_province` varchar(255) not null, modify `country` varchar(255) not null;');
    this.addSql('alter table `location` add constraint `location_appointment_id_foreign` foreign key (`appointment_id`) references `appointment` (`id`) on update cascade;');
    this.addSql('alter table `location` add index `location_appointment_id_index`(`appointment_id`);');
  }

}
