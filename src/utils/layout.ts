import { AppointmentDto } from '../appointment/dtos/appointment.dto';
import moment from 'moment';

/**
 * Utility class for generating appointment schedule notifications layout or structured message using HTML.
 *
 * This class provides a static method to generate appointment schedule notifications layout
 * for participants based on appointment data or actions.
 */
export class Layout {
   // For new appointment schedule email
   public static appointmentSchedule(data: AppointmentDto): string {
      const locationInfo = data.locationLink ? `<li><strong>Link: </strong> ${data.locationLink}</li>` : '';

      const address = (
         data.location.streetNr || data.location.streetName ||
         data.location.city || data.location.country
      ) ? `<li><strong>Address: </strong> ${data.location.streetNr || ''} ${data.location.streetName || ''}, ${
            data.location.city || ''} ${data.location.stateOrProvince || ''}}, ${data.location.postCode || ''} ${
            data.location.country || ''} </li>` : '';

      return `
        <p>Dear Participant,</p>
        <br>
        <p>We are pleased to inform you about your upcoming appointment scheduled as follows:</p>
        <br>
        <p><strong>Appointment Details:</strong></p>
        <ul>
            <li><strong>Purpose: </strong> ${data.description}</li>
            <li><strong>Date: </strong> ${moment(data.validForStartDateTime).format('MMM DD YYYY')}</li>
            <li><strong>Start Time: </strong> ${data.validForStartDateTime}</li>
            <li><strong>End Time: </strong> ${data.validForEndDateTime}</li>
            <li><strong>Location: </strong> ${data.location.name}</li>
            ${locationInfo} ${address}
        </ul>
        <br>
        <p>Please mark your calendar accordingly.</p>
        <br>
        <p>Thank You.</p>
    `;
   }

}