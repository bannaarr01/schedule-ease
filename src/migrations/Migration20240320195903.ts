import { Migration } from '@mikro-orm/migrations';

export class Migration20240320195903 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table `participant` (`id` int unsigned not null auto_increment primary key, `name` varchar(255) not null, `role` varchar(255) not null, `appointment_id` int unsigned not null, `contact_medium_id` int unsigned not null) default character set utf8mb4 engine = InnoDB;');
    this.addSql('alter table `participant` add index `participant_appointment_id_index`(`appointment_id`);');
    this.addSql('alter table `participant` add unique `participant_contact_medium_id_unique`(`contact_medium_id`);');

    this.addSql('alter table `participant` add constraint `participant_appointment_id_foreign` foreign key (`appointment_id`) references `appointment` (`id`) on update cascade;');
    this.addSql('alter table `participant` add constraint `participant_contact_medium_id_foreign` foreign key (`contact_medium_id`) references `contact_medium` (`id`) on update cascade;');

    this.addSql('drop table if exists `related_party`;');

    this.addSql('alter table `contact_medium` drop foreign key `contact_medium_appointment_id_foreign`;');
    this.addSql('alter table `contact_medium` drop foreign key `contact_medium_attribute_id_foreign`;');

    this.addSql('alter table `contact_medium` drop index `contact_medium_appointment_id_index`;');
    this.addSql('alter table `contact_medium` drop column `appointment_id`;');

    this.addSql('alter table `contact_medium` modify `attribute_id` int unsigned not null;');
    this.addSql('alter table `contact_medium` add constraint `contact_medium_attribute_id_foreign` foreign key (`attribute_id`) references `contact_medium_attribute` (`id`) on update cascade;');
  }

  async down(): Promise<void> {
    this.addSql('create table `related_party` (`id` int unsigned not null auto_increment primary key, `name` varchar(255) not null, `role` varchar(255) not null, `appointment_id` int unsigned not null, `created_by_id` varchar(255) not null, `created_by_name` varchar(255) not null, `created_at` datetime not null) default character set utf8mb4 engine = InnoDB;');
    this.addSql('alter table `related_party` add index `related_party_appointment_id_index`(`appointment_id`);');

    this.addSql('alter table `related_party` add constraint `related_party_appointment_id_foreign` foreign key (`appointment_id`) references `appointment` (`id`) on update cascade;');

    this.addSql('drop table if exists `participant`;');

    this.addSql('alter table `contact_medium` drop foreign key `contact_medium_attribute_id_foreign`;');

    this.addSql('alter table `contact_medium` add `appointment_id` int unsigned not null;');
    this.addSql('alter table `contact_medium` modify `attribute_id` int unsigned null;');
    this.addSql('alter table `contact_medium` add constraint `contact_medium_appointment_id_foreign` foreign key (`appointment_id`) references `appointment` (`id`) on update cascade;');
    this.addSql('alter table `contact_medium` add constraint `contact_medium_attribute_id_foreign` foreign key (`attribute_id`) references `contact_medium_attribute` (`id`) on update cascade on delete set null;');
    this.addSql('alter table `contact_medium` add index `contact_medium_appointment_id_index`(`appointment_id`);');
  }

}
