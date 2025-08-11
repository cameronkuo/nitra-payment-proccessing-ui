/**
 * Payment processing constants
 */

import { formatCurrency } from 'src/utils/payment-calculations';

/** Minimum payment amount in USD */
export const MINIMUM_PAYMENT_AMOUNT = 0.5;

/** Minimum payment amount formatted as currency */
export const MINIMUM_PAYMENT_AMOUNT_FORMATTED = formatCurrency(MINIMUM_PAYMENT_AMOUNT);
