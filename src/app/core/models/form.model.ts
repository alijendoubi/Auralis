export interface Form {
  id: string;
  therapistId: string;
  name: string;
  description?: string;
  fields: FormField[];
  isActive: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

export interface FormField {
  id: string;
  type: 'text' | 'textarea' | 'checkbox' | 'radio' | 'select' | 'date' | 'email' | 'phone' | 'number';
  label: string;
  placeholder?: string;
  required: boolean;
  order: number;
  options?: string[]; // For radio, checkbox, select
  defaultValue?: any;
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    min?: number;
    max?: number;
  };
}

export interface FormResponse {
  id: string;
  formId: string;
  clientId: string;
  responses: {
    [fieldId: string]: any;
  };
  submittedAt: Date;
  updatedAt?: Date;
}
