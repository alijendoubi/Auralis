export interface Availability {
  id: string;
  therapistId: string;
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sunday, 1 = Monday, etc.
  startTime: string; // Format: "HH:MM" in 24-hour format
  endTime: string; // Format: "HH:MM" in 24-hour format
  isAvailable: boolean;
  breaks?: TimeSlot[];
  createdAt: Date;
  updatedAt?: Date;
}

export interface TimeSlot {
  id: string;
  startTime: string; // Format: "HH:MM" in 24-hour format
  endTime: string; // Format: "HH:MM" in 24-hour format
}

export interface SpecialAvailability {
  id: string;
  therapistId: string;
  date: Date;
  isAvailable: boolean;
  startTime?: string; // Format: "HH:MM" in 24-hour format
  endTime?: string; // Format: "HH:MM" in 24-hour format
  breaks?: TimeSlot[];
  reason?: string;
  createdAt: Date;
  updatedAt?: Date;
}
