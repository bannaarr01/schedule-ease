import { Migration } from '@mikro-orm/migrations';

export class Migration20240310023159 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table `appointment_log` (`id` int unsigned not null auto_increment primary key, `appointment_id` int not null, `status` int not null, `updated_by_id` varchar(255) not null, `updated_by_name` varchar(255) not null, `created_at` datetime not null) default character set utf8mb4 engine = InnoDB;');
  }

  async down(): Promise<void> {
    this.addSql('drop table if exists `appointment_log`;');
  }

}
