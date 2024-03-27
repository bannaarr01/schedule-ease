import { plainToInstance } from 'class-transformer';

interface ClassConstructor {
   new(...args: any[]): {}
}

export class MiscUtils {
   public static serialize(dto: ClassConstructor, data: any): any {
      return plainToInstance(dto, data, {
         excludeExtraneousValues: true,
      });
   }
}