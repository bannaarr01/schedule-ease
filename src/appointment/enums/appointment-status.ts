/**
 * Enum representing the status of an appointment.
 */
export enum AppointmentStatus {
  CREATED = 'CREATED',
  ASSIGNED = 'ASSIGNED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
  RESCHEDULED = 'RESCHEDULED'
}

export enum AppointmentStatusID {
  CREATED = 1,
  ASSIGNED,
  CANCELLED,
  COMPLETED,
  RESCHEDULED
}