import { Migration } from '@mikro-orm/migrations';

export class Migration20240330014708 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table `contact_medium` drop foreign key `contact_medium_attribute_id_foreign`;');

    this.addSql('alter table `participant` drop foreign key `participant_contact_medium_id_foreign`;');

    this.addSql('alter table `contact_medium` modify `attribute_id` int unsigned null;');
    this.addSql('alter table `contact_medium` add constraint `contact_medium_attribute_id_foreign` foreign key (`attribute_id`) references `contact_medium_attribute` (`id`) on update cascade on delete cascade;');

    this.addSql('alter table `participant` modify `contact_medium_id` int unsigned null;');
    this.addSql('alter table `participant` add constraint `participant_contact_medium_id_foreign` foreign key (`contact_medium_id`) references `contact_medium` (`id`) on update cascade on delete cascade;');
  }

  async down(): Promise<void> {
    this.addSql('alter table `contact_medium` drop foreign key `contact_medium_attribute_id_foreign`;');

    this.addSql('alter table `participant` drop foreign key `participant_contact_medium_id_foreign`;');

    this.addSql('alter table `contact_medium` modify `attribute_id` int unsigned not null;');
    this.addSql('alter table `contact_medium` add constraint `contact_medium_attribute_id_foreign` foreign key (`attribute_id`) references `contact_medium_attribute` (`id`) on update cascade;');

    this.addSql('alter table `participant` modify `contact_medium_id` int unsigned not null;');
    this.addSql('alter table `participant` add constraint `participant_contact_medium_id_foreign` foreign key (`contact_medium_id`) references `contact_medium` (`id`) on update cascade;');
  }

}
