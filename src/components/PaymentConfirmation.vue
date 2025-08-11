<template>
  <div class="payment-confirmation q-pa-lg">
    <div class="text-center q-mb-lg">
      <q-icon class="q-mb-md" color="positive" name="fas fa-check-circle" size="4rem" />
      <div class="text-h4 text-positive">Payment Successful!</div>
      <div class="text-body2 text-grey-7 q-mt-sm">
        Transaction completed on {{ formatDate(new Date()) }}
      </div>
    </div>

    <q-card class="receipt-card">
      <q-card-section class="receipt-header">
        <div class="text-h6">Payment Receipt</div>
        <div class="text-body2 text-grey-7">Transaction ID: {{ transactionId }}</div>
      </q-card-section>

      <q-separator />

      <q-card-section>
        <!-- Location Information -->
        <div class="receipt-section">
          <div class="section-title">Location</div>
          <div class="section-content">{{ location?.name }}</div>
        </div>

        <!-- Payment Method -->
        <div class="receipt-section">
          <div class="section-title">Payment Method</div>
          <div class="section-content">
            <q-icon
              class="q-mr-sm"
              :name="paymentData.method === 'cash' ? 'fas fa-money-bill' : 'fas fa-credit-card'"
            />
            {{ paymentData.method === 'cash' ? 'Cash Payment' : 'Card Payment' }}
            <div
              v-if="paymentData.method === 'card' && paymentData.readerId"
              class="text-caption text-grey-7"
            >
              Reader: {{ getReaderLabel(paymentData.readerId) }}
            </div>
            <div
              v-if="paymentData.method === 'card' && paymentData.cardDetails"
              class="text-caption text-grey-7"
            >
              Card ending in {{ getCardLastFour(paymentData.cardDetails.number) }}
            </div>
          </div>
        </div>

        <!-- Amount Breakdown -->
        <div class="receipt-section">
          <div class="section-title">Amount Breakdown</div>
          <div class="breakdown-table">
            <div class="breakdown-row">
              <span>Subtotal:</span>
              <span>{{ formatCurrency(calculation.subtotal) }}</span>
            </div>
            <div class="breakdown-row">
              <span>Tax ({{ formatPercentage(parseFloat(location?.taxRate || '0')) }}):</span>
              <span>{{ formatCurrency(calculation.tax) }}</span>
            </div>
            <div v-if="paymentData.method === 'card'" class="breakdown-row">
              <span>Processing Fee:</span>
              <span>{{ formatCurrency(calculation.processingFee) }}</span>
            </div>
            <q-separator class="q-my-sm" />
            <div class="breakdown-row total-row">
              <span class="text-weight-bold">Total Paid:</span>
              <span class="text-weight-bold">{{ formatCurrency(calculation.total) }}</span>
            </div>
          </div>
        </div>

        <!-- Processing Fee Breakdown (for card payments) -->
        <div v-if="paymentData.method === 'card'" class="receipt-section">
          <div class="section-title">Processing Fee Distribution</div>
          <div class="breakdown-table">
            <div class="breakdown-row">
              <span>Merchant Fee:</span>
              <span class="text-negative">{{ formatCurrency(calculation.merchantFee) }}</span>
            </div>
            <div class="breakdown-row">
              <span>Patient Fee:</span>
              <span class="text-negative">{{ formatCurrency(calculation.patientFee) }}</span>
            </div>
          </div>
        </div>
      </q-card-section>

      <q-separator />

      <q-card-actions align="center" class="q-py-md">
        <q-btn
          color="primary"
          icon="fas fa-print"
          label="Print Receipt"
          outline
          @click="printReceipt"
        />
        <q-btn
          color="primary"
          icon="fas fa-plus"
          label="New Payment"
          @click="$emit('new-payment')"
        />
      </q-card-actions>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { formatCurrency, formatPercentage } from 'src/utils/payment-calculations';

import type { Location, PaymentCalculation, PaymentData, PaymentReader } from 'src/types/payment';

interface Props {
  paymentData: PaymentData;
  location: Location | null;
  readers: PaymentReader[];
  calculation: PaymentCalculation;
  transactionId?: string;
}

interface Emits {
  (e: 'new-payment'): void;
}

const props = defineProps<Props>();
defineEmits<Emits>();

const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getReaderLabel = (readerId: string): string => {
  const reader = props.readers.find((r) => r.readerId === readerId);
  return reader ? reader.label : readerId;
};

const getCardLastFour = (cardNumber: string): string => {
  return cardNumber.replace(/\s/g, '').slice(-4);
};

const printReceipt = () => {
  window.print();
};
</script>

<style scoped>
.payment-confirmation {
  max-width: 600px;
  margin: 0 auto;
}

.receipt-card {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.receipt-header {
  background: #f8f9fa;
}

.receipt-section {
  margin-bottom: 1.5rem;
}

.section-title {
  font-weight: 600;
  color: #666;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.5rem;
}

.section-content {
  font-size: 1rem;
  color: #333;
}

.breakdown-table {
  width: 100%;
}

.breakdown-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.25rem 0;
}

.total-row {
  font-size: 1.125rem;
  padding-top: 0.5rem;
}

@media print {
  .payment-confirmation {
    max-width: none;
  }

  .q-card-actions {
    display: none !important;
  }
}
</style>
