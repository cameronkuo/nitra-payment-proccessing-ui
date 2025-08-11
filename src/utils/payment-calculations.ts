import type { Location, Organization, ProcessingFeeConfig, PaymentCalculation } from 'src/types/payment';

export const calculatePaymentTotals = (
  amount: number,
  location: Location,
  organization?: Organization,
  processingFeeConfig?: ProcessingFeeConfig
): PaymentCalculation => {
  const subtotal = amount;
  const taxRate = parseFloat(location.taxRate);
  const tax = subtotal * taxRate;

  let processingFee = 0;
  let merchantFee = 0;
  let patientFee = 0;

  if (organization && processingFeeConfig) {
    // Split fees between merchant and patient
    merchantFee = processingFeeConfig.merchantFixed + (processingFeeConfig.merchantPercentage * amount / 100);
    patientFee = processingFeeConfig.patientFixed + (processingFeeConfig.patientPercentage * amount / 100);
    
    // Processing fee in the summary represents what the patient pays
    processingFee = patientFee;
  }

  // Total includes only patient fee (merchant fee is paid separately by merchant)
  const total = subtotal + tax + processingFee;

  return {
    subtotal,
    tax,
    processingFee,
    merchantFee,
    patientFee,
    total
  };
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

export const formatPercentage = (value: number): string => {
  return `${(value * 100).toFixed(2)}%`;
};