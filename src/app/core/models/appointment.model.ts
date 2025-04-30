export interface Appointment {
  id: string;
  therapistId: string;
  clientId: string;
  startTime: Date;
  endTime: Date;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';
  type: 'initial-consultation' | 'follow-up' | 'therapy-session' | 'assessment';
  location: 'in-person' | 'video' | 'phone';
  notes?: string;
  reminderSent: boolean;
  isPaid: boolean;
  paymentId?: string;
  createdAt: Date;
  updatedAt?: Date;
}
