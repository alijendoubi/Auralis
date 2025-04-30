export interface Review {
  id: string;
  clientId: string;
  therapistId: string;
  appointmentId: string;
  rating: number; // 1-5 stars
  comment?: string;
  isPublic: boolean;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  updatedAt?: Date;
}
