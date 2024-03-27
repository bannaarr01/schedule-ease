import { Entity, Enum, PrimaryKey, Property } from '@mikro-orm/core';
import { LogAction } from '../enums/log-action';

@Entity()
export class LogEntry {
  @PrimaryKey()
     id!: number;
  
  @Property()
     entityId: number;

  @Property()
     entityType: string;

  @Enum(() => LogAction)
     action!: LogAction;

  @Property({ nullable: true, default: null, length: 2500 })
     oldValue?: string;

  @Property({ nullable: true, default: null, length: 2500 })
     newValue?: string;
  
  @Property()
     createdById: string;
  
  @Property()
     createdByName: string;

  @Property({ onCreate: () => new Date() })
     createdAt: Date

  constructor(
     entityId: number,
     entityType: string,
     action: LogAction,
     oldValue: string,
     newValue: string,
     createdById: string,
     createdByName: string
  ) {
     this.entityId = entityId;
     this.entityType = entityType;
     this.action = action;
     this.oldValue = oldValue;
     this.newValue = newValue;
     this.createdById = createdById;
     this.createdByName = createdByName;
  }
}