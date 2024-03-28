import { Migration } from '@mikro-orm/migrations';

export class Migration20240327141109 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table `appointment_status` (`id` integer not null primary key autoincrement, `status_name` text not null, `status_desc` text null);');

    this.addSql('create table `contact_medium_attribute` (`id` integer not null primary key autoincrement, `phone_number` text null, `email` text null, `fax_number` text null, `social_network_id` text null, `street` text null, `city` text null, `state_or_province` text null, `country` text null);');

    this.addSql('create table `contact_medium` (`id` integer not null primary key autoincrement, `attribute_id` integer not null, `medium_type` text null, constraint `contact_medium_attribute_id_foreign` foreign key(`attribute_id`) references `contact_medium_attribute`(`id`) on update cascade);');
    this.addSql('create unique index `contact_medium_attribute_id_unique` on `contact_medium` (`attribute_id`);');

    this.addSql('create table `location` (`id` integer not null primary key autoincrement, `name` text not null, `street_nr` text null, `street_name` text null, `post_code` text null, `city` text null, `state_or_province` text null, `country` text null);');

    this.addSql('create table `appointment` (`id` integer not null primary key autoincrement, `description` text not null, `creator_id` text not null, `created_by` text not null, `category` text not null, `valid_for_start_date_time` datetime not null, `valid_for_end_date_time` datetime not null, `status_id` integer null, `created_at` datetime not null, `updated_by` text null, `updated_at` datetime not null, `location_type` text check (`location_type` in (\'PHYSICAL\', \'ONLINE\')) not null, `location_link` text null, `location_id` integer not null, constraint `appointment_status_id_foreign` foreign key(`status_id`) references `appointment_status`(`id`) on delete cascade on update cascade, constraint `appointment_location_id_foreign` foreign key(`location_id`) references `location`(`id`) on update cascade);');
    this.addSql('create index `appointment_status_id_index` on `appointment` (`status_id`);');
    this.addSql('create unique index `appointment_location_id_unique` on `appointment` (`location_id`);');

    this.addSql('create table `calendar_event` (`id` integer not null primary key autoincrement, `appointment_id` integer not null, `name` text not null, constraint `calendar_event_appointment_id_foreign` foreign key(`appointment_id`) references `appointment`(`id`) on update cascade);');
    this.addSql('create index `calendar_event_appointment_id_index` on `calendar_event` (`appointment_id`);');

    this.addSql('create table `attachment` (`id` integer not null primary key autoincrement, `appointment_id` integer not null, `attachment_type` text not null, `mime_type` text not null, `original_name` text not null, `path` text not null, `size` integer not null, `uploaded_by_id` text not null, `uploaded_by_name` text not null, `description` text null, `uploaded_at` datetime not null, constraint `attachment_appointment_id_foreign` foreign key(`appointment_id`) references `appointment`(`id`) on update cascade);');
    this.addSql('create index `attachment_appointment_id_index` on `attachment` (`appointment_id`);');

    this.addSql('create table `log_entry` (`id` integer not null primary key autoincrement, `entity_id` integer not null, `entity_type` text not null, `action` text check (`action` in (\'CREATE\', \'UPDATE\', \'DELETE\')) not null, `old_value` text null, `new_value` text null, `created_by_id` text not null, `created_by_name` text not null, `created_at` datetime not null);');

    this.addSql('create table `note` (`id` integer not null primary key autoincrement, `appointment_id` integer not null, `author` text not null, `text` text not null, `created_at` datetime not null, constraint `note_appointment_id_foreign` foreign key(`appointment_id`) references `appointment`(`id`) on update cascade);');
    this.addSql('create index `note_appointment_id_index` on `note` (`appointment_id`);');

    this.addSql('create table `participant` (`id` integer not null primary key autoincrement, `name` text not null, `role` text not null, `appointment_id` integer not null, `contact_medium_id` integer not null, constraint `participant_appointment_id_foreign` foreign key(`appointment_id`) references `appointment`(`id`) on update cascade, constraint `participant_contact_medium_id_foreign` foreign key(`contact_medium_id`) references `contact_medium`(`id`) on update cascade);');
    this.addSql('create index `participant_appointment_id_index` on `participant` (`appointment_id`);');
    this.addSql('create unique index `participant_contact_medium_id_unique` on `participant` (`contact_medium_id`);');
  }

}
