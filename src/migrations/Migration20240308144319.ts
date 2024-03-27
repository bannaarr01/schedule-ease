import { Migration } from '@mikro-orm/migrations';

export class Migration20240308144319 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table `appointment_status` (`id` int unsigned not null auto_increment primary key, `status_name` varchar(255) not null, `status_desc` varchar(255) null) default character set utf8mb4 engine = InnoDB;');

    this.addSql('alter table `appointment` drop column `status`;');

    this.addSql('alter table `appointment` add `status_id` int unsigned not null;');
    this.addSql('alter table `appointment` add constraint `appointment_status_id_foreign` foreign key (`status_id`) references `appointment_status` (`id`) on update cascade;');
    this.addSql('alter table `appointment` add index `appointment_status_id_index`(`status_id`);');

    this.addSql('alter table `related_party` add `created_by_id` varchar(255) not null, add `created_by_name` varchar(255) not null, add `created_at` datetime not null;');
  }

  async down(): Promise<void> {
    this.addSql('alter table `appointment` drop foreign key `appointment_status_id_foreign`;');

    this.addSql('drop table if exists `appointment_status`;');

    this.addSql('alter table `appointment` drop index `appointment_status_id_index`;');
    this.addSql('alter table `appointment` drop column `status_id`;');

    this.addSql('alter table `appointment` add `status` varchar(255) not null;');

    this.addSql('alter table `related_party` drop column `created_by_id`;');
    this.addSql('alter table `related_party` drop column `created_by_name`;');
    this.addSql('alter table `related_party` drop column `created_at`;');
  }

}
