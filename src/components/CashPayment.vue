<template>
  <div class="cash-payment">
    <div class="row q-gutter-md">
      <!-- Amount Input -->
      <div class="col-12">
        <q-input
          filled
          label="Payment Amount"
          min="0"
          :model-value="amount"
          prefix="$"
          :rules="[val => val > 0 || 'Amount must be greater than 0']"
          step="0.01"
          type="number"
          @update:model-value="onAmountChange"
        />
      </div>

      <!-- Payment Summary -->
      <div v-if="amount > 0 && location" class="col-12">
        <q-card class="payment-summary">
          <q-card-section>
            <div class="text-h6 q-mb-md">Payment Summary</div>
            
            <div class="summary-row">
              <span>Subtotal:</span>
              <span>{{ formatCurrency(calculation.subtotal) }}</span>
            </div>
            
            <div class="summary-row">
              <span>Tax ({{ formatPercentage(parseFloat(location.taxRate)) }}):</span>
              <span>{{ formatCurrency(calculation.tax) }}</span>
            </div>
            
            <q-separator class="q-my-sm" />
            
            <div class="summary-row text-weight-bold text-h6">
              <span>Total:</span>
              <span>{{ formatCurrency(calculation.total) }}</span>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Minimum Amount Error -->
      <div v-if="amount > 0 && location && calculation.total < 0.5" class="col-12">
        <q-banner class="text-warning bg-orange-1">
          <q-icon class="q-mr-sm" name="fas fa-exclamation-triangle" />
          Total amount falls below the required minimum of $0.50
        </q-banner>
      </div>

      <!-- Process Payment Button -->
      <div class="col-12">
        <q-btn
          class="full-width"
          color="primary"
          :disabled="!canProcessPayment"
          size="lg"
          @click="processPayment"
        >
          <q-icon class="q-mr-sm" name="fas fa-money-bill" />
          Process Cash Payment
        </q-btn>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import { calculatePaymentTotals, formatCurrency, formatPercentage } from 'src/utils/payment-calculations';

import type { Location, PaymentData } from 'src/types/payment';

interface Props {
  location: Location | null;
  amount: number;
}

interface Emits {
  (e: 'update:amount', value: number): void;
  (e: 'process-payment', data: PaymentData): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const calculation = computed(() => {
  if (!props.location || props.amount <= 0) {
    return {
      subtotal: 0,
      tax: 0,
      processingFee: 0,
      merchantFee: 0,
      patientFee: 0,
      total: 0
    };
  }
  
  return calculatePaymentTotals(props.amount, props.location);
});

const canProcessPayment = computed(() => 
  props.amount > 0 && props.location !== null && calculation.value.total >= 0.5
);

const onAmountChange = (value: string | number | null) => {
  const numValue = typeof value === 'string' ? parseFloat(value) : (value || 0);
  emit('update:amount', numValue);
};

const processPayment = () => {
  if (!canProcessPayment.value || !props.location) return;

  const paymentData: PaymentData = {
    amount: props.amount,
    method: 'cash',
    locationId: props.location.id
  };

  emit('process-payment', paymentData);
};
</script>

<style scoped>
.payment-summary {
  background: #f5f5f5;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
}
</style>