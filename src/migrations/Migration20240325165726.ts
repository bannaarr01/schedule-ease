import { Migration } from '@mikro-orm/migrations';

export class Migration20240325165726 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table `log_entry` (`id` int unsigned not null auto_increment primary key, `entity_id` int not null, `entity_type` int not null, `action` enum(\'CREATE\', \'UPDATE\', \'DELETE\') not null, `old_value` varchar(255) not null, `new_value` varchar(255) not null, `created_by_id` varchar(255) not null, `created_by_name` varchar(255) not null, `created_at` datetime not null) default character set utf8mb4 engine = InnoDB;');

    this.addSql('drop table if exists `appointment_log`;');

    this.addSql('alter table `appointment` modify `location_type` enum(\'PHYSICAL\', \'ONLINE\') not null;');
  }

  async down(): Promise<void> {
    this.addSql('create table `appointment_log` (`id` int unsigned not null auto_increment primary key, `appointment_id` int not null, `status` int not null, `created_by_id` varchar(255) not null, `created_by_name` varchar(255) not null, `created_at` datetime not null) default character set utf8mb4 engine = InnoDB;');

    this.addSql('drop table if exists `log_entry`;');

    this.addSql('alter table `appointment` modify `location_type` varchar(255) not null;');
  }

}
