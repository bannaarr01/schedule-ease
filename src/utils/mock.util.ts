import { CreateAppointmentDto } from '../appointment/dtos/create-appointment.dto';
import { LocationType } from '../appointment/enums/location-type';
import { CreateAttachmentDto } from '../appointment/dtos/create-attachment.dto';

export const appointmentDto: CreateAppointmentDto = {
   'description': 'Fix an electrical issue for a customer',
   'category': 'Intervention',
   'validForStartDateTime': new Date(new Date().getTime() + (10 * 60 * 1000)),
   'validForEndDateTime': new Date(new Date().getTime() + (30 * 60 * 1000)), // plus 30mins
   'participant': [
      {
         'name': 'John Doe',
         'role': 'electrician',
         'contactMedium': {
            'attribute': {
               'phoneNumber': '123456789',
               'email': 'johndoe@email.com',
               'city': 'Kuala Lumpur'
            }
         }
      },
      {
         'name': 'Kim George',
         'role': 'Finance2',
         'contactMedium': {
            'attribute': {
               'phoneNumber': '1234567892',
               'email': 'kimgeorge@email.com',
               'city': 'Putrajaya'
            }
         }
      }
   ],
   'location': {
      'name': 'Kim Residence',
      'streetNr': 'T1 2-1',
      'streetName': 'Bayer str',
      'postCode': '65000',
      'city': 'Putrajaya',
      'country': 'Malaysia'
   },
   'locationType': 'PHYSICAL' as LocationType // for typing
}

export const attachmentDto: CreateAttachmentDto = {
   appointmentId: 123,
   attachmentType: 'mockExtension',
   originalName: 'mockFileName.txt',
   mimeType: 'text/plain',
   size: 1000,
   path: 'mockFilePath',
   uploadedById: 'mockUserId',
   uploadedByName: 'mockUserName',
   description: 'mockDescription'
};