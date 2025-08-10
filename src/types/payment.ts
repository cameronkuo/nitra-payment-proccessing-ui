export interface Location {
  id: number;
  name: string;
  taxRate: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface Organization {
  id: number;
  name: string;
  totalProcessingFeeFixed: number;
  totalProcessingFeePercentage: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface PaymentReader {
  id: number;
  label: string;
  readerId: string;
  status: string;
  locationId: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface ProcessingFeeConfig {
  merchantFixed: number;
  merchantPercentage: number;
  patientFixed: number;
  patientPercentage: number;
}

export interface PaymentData {
  amount: number;
  method: 'cash' | 'card';
  locationId: number;
  readerId?: string;
  cardDetails?: {
    number: string;
    expiryMonth: string;
    expiryYear: string;
    cvv: string;
    cardholderName: string;
  };
}

export interface PaymentCalculation {
  subtotal: number;
  tax: number;
  processingFee: number;
  merchantFee: number;
  patientFee: number;
  total: number;
}