export interface BookableSlot {
  startUtc: string;
  endUtc: string;
  startInPatientTz: string;
  endInPatientTz: string;
}

export interface AvailabilityWindow {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  startUtc: string;
  endUtc: string;
  duration: number;
  modality: 'online' | 'in_person';
  bookableStarts: BookableSlot[];
}

export interface DailyAvailability {
  [date: string]: AvailabilityWindow[];
}

export interface AvailabilityResponse {
  therapistId: string;
  sessionTypeId: string;
  weekStart: string;
  patientTz: string;
  stepMin: number;
  availability: DailyAvailability;
}
