import { Migration } from '@mikro-orm/migrations';

export class Migration20240302103244 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table `appointment` (`id` int unsigned not null auto_increment primary key, `description` varchar(255) not null, `category` varchar(255) null, `valid_for_start_date_time` datetime not null, `valid_for_end_date_time` datetime not null, `status` varchar(255) not null, `created_at` datetime not null, `updated_at` datetime not null, `location_type` varchar(255) null, `location_link` varchar(255) null) default character set utf8mb4 engine = InnoDB;');

    this.addSql('create table `attachment` (`id` int unsigned not null auto_increment primary key, `appointment_id` int unsigned not null, `attachment_type` varchar(255) not null, `mime_type` varchar(255) not null, `original_name` varchar(255) not null, `path` varchar(255) not null, `size` int not null, `content` varchar(255) null, `description` varchar(255) null, `uploaded_at` datetime not null) default character set utf8mb4 engine = InnoDB;');
    this.addSql('alter table `attachment` add index `attachment_appointment_id_index`(`appointment_id`);');

    this.addSql('create table `calendar_event` (`id` int unsigned not null auto_increment primary key, `appointment_id` int unsigned not null, `name` varchar(255) not null) default character set utf8mb4 engine = InnoDB;');
    this.addSql('alter table `calendar_event` add index `calendar_event_appointment_id_index`(`appointment_id`);');

    this.addSql('create table `contact_medium_attribute` (`id` int unsigned not null auto_increment primary key, `phone_number` varchar(255) null, `email` varchar(255) null, `fax_number` varchar(255) null, `social_network_id` varchar(255) null, `street` varchar(255) null, `city` varchar(255) null, `state_or_province` varchar(255) null, `country` varchar(255) null) default character set utf8mb4 engine = InnoDB;');

    this.addSql('create table `contact_medium` (`id` int unsigned not null auto_increment primary key, `appointment_id` int unsigned not null, `medium_type` varchar(255) null, `attribute_id` int unsigned null) default character set utf8mb4 engine = InnoDB;');
    this.addSql('alter table `contact_medium` add index `contact_medium_appointment_id_index`(`appointment_id`);');
    this.addSql('alter table `contact_medium` add unique `contact_medium_attribute_id_unique`(`attribute_id`);');

    this.addSql('create table `location` (`id` int unsigned not null auto_increment primary key, `appointment_id` int unsigned not null, `name` varchar(255) not null, `street_nr` varchar(255) not null, `street_name` varchar(255) not null, `post_code` varchar(255) not null, `city` varchar(255) not null, `state_or_province` varchar(255) not null, `country` varchar(255) not null) default character set utf8mb4 engine = InnoDB;');
    this.addSql('alter table `location` add index `location_appointment_id_index`(`appointment_id`);');

    this.addSql('create table `note` (`id` int unsigned not null auto_increment primary key, `appointment_id` int unsigned null, `author` varchar(255) null, `text` varchar(255) null, `created_at` datetime not null) default character set utf8mb4 engine = InnoDB;');
    this.addSql('alter table `note` add index `note_appointment_id_index`(`appointment_id`);');

    this.addSql('create table `related_party` (`id` int unsigned not null auto_increment primary key, `name` varchar(255) not null, `role` varchar(255) not null, `appointment_id` int unsigned not null) default character set utf8mb4 engine = InnoDB;');
    this.addSql('alter table `related_party` add index `related_party_appointment_id_index`(`appointment_id`);');

    this.addSql('alter table `attachment` add constraint `attachment_appointment_id_foreign` foreign key (`appointment_id`) references `appointment` (`id`) on update cascade;');

    this.addSql('alter table `calendar_event` add constraint `calendar_event_appointment_id_foreign` foreign key (`appointment_id`) references `appointment` (`id`) on update cascade;');

    this.addSql('alter table `contact_medium` add constraint `contact_medium_appointment_id_foreign` foreign key (`appointment_id`) references `appointment` (`id`) on update cascade;');
    this.addSql('alter table `contact_medium` add constraint `contact_medium_attribute_id_foreign` foreign key (`attribute_id`) references `contact_medium_attribute` (`id`) on update cascade on delete set null;');

    this.addSql('alter table `location` add constraint `location_appointment_id_foreign` foreign key (`appointment_id`) references `appointment` (`id`) on update cascade;');

    this.addSql('alter table `note` add constraint `note_appointment_id_foreign` foreign key (`appointment_id`) references `appointment` (`id`) on update cascade on delete set null;');

    this.addSql('alter table `related_party` add constraint `related_party_appointment_id_foreign` foreign key (`appointment_id`) references `appointment` (`id`) on update cascade;');
  }

}
