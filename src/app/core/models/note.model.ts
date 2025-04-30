export interface Note {
  id: string;
  therapistId: string;
  clientId: string;
  appointmentId?: string;
  title: string;
  content: string;
  template: 'SOAP' | 'DAP' | 'custom';
  templateData?: {
    [key: string]: any;
  };
  tags?: string[];
  isEncrypted: boolean;
  versionHistory?: {
    timestamp: Date;
    content: string;
    modifiedBy: string;
  }[];
  createdAt: Date;
  updatedAt?: Date;
}

export interface SOAPNote {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
}

export interface DAPNote {
  data: string;
  assessment: string;
  plan: string;
}
