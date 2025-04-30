export interface Reminder {
  id: string;
  appointmentId: string;
  clientId: string;
  therapistId: string;
  type: 'email' | 'sms' | 'both';
  status: 'pending' | 'sent' | 'failed';
  scheduledFor: Date;
  sentAt?: Date;
  content: string;
  templateId?: string;
  metadata?: {
    emailId?: string;
    smsId?: string;
    error?: string;
  };
  createdAt: Date;
  updatedAt?: Date;
}

export interface ReminderTemplate {
  id: string;
  therapistId: string;
  name: string;
  type: 'email' | 'sms' | 'both';
  emailSubject?: string;
  emailBody?: string;
  smsBody?: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt?: Date;
}
