export interface Payment {
  id: string;
  clientId: string;
  therapistId: string;
  appointmentId?: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod: 'card' | 'bank' | 'cash' | 'insurance' | 'other';
  paymentMethodDetails?: {
    [key: string]: any;
  };
  stripePaymentId?: string;
  stripePaymentIntentId?: string;
  invoiceId?: string;
  description?: string;
  metadata?: {
    [key: string]: any;
  };
  createdAt: Date;
  updatedAt?: Date;
}

export interface Invoice {
  id: string;
  clientId: string;
  therapistId: string;
  paymentId?: string;
  invoiceNumber: string;
  amount: number;
  currency: string;
  status: 'draft' | 'sent' | 'paid' | 'void' | 'overdue';
  dueDate: Date;
  items: InvoiceItem[];
  notes?: string;
  createdAt: Date;
  updatedAt?: Date;
  paidAt?: Date;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  metadata?: {
    [key: string]: any;
  };
}
