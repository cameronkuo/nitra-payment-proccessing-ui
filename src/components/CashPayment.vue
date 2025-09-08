<template>
  <div class="cash-payment">
    <div class="row q-gutter-md">
      <!-- Payment Summary -->
      <div v-if="paymentStore.paymentAmount > 0 && paymentStore.currentLocation" class="col-12">
        <q-card class="payment-summary">
          <q-card-section>
            <div class="text-h6 q-mb-md">Payment Summary</div>

            <div class="summary-row">
              <span>Subtotal:</span>
              <span>{{ formatCurrency(paymentStore.currentCalculation?.subtotal || 0) }}</span>
            </div>

            <div class="summary-row">
              <span
                >Tax ({{
                  formatPercentage(parseFloat(paymentStore.currentLocation?.taxRate || '0'))
                }}):</span
              >
              <span>{{ formatCurrency(paymentStore.currentCalculation?.tax || 0) }}</span>
            </div>

            <q-separator class="q-my-sm" />

            <div class="summary-row text-weight-bold text-h6">
              <span>Total:</span>
              <span>{{ formatCurrency(paymentStore.currentCalculation?.total || 0) }}</span>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Minimum Amount Error -->
      <div
        v-if="
          paymentStore.paymentAmount > 0 &&
          paymentStore.currentLocation &&
          (paymentStore.currentCalculation?.total || 0) < MINIMUM_PAYMENT_AMOUNT
        "
        class="col-12"
      >
        <q-banner class="text-warning bg-orange-1">
          <q-icon class="q-mr-sm" name="fas fa-exclamation-triangle" />
          Total amount falls below the required minimum of {{ MINIMUM_PAYMENT_AMOUNT_FORMATTED }}
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

import { MINIMUM_PAYMENT_AMOUNT, MINIMUM_PAYMENT_AMOUNT_FORMATTED } from 'src/constants/payment';
import { usePaymentStore } from 'src/stores/payment-store';
import { formatCurrency, formatPercentage } from 'src/utils/payment-calculations';

import type { PaymentData } from 'src/types/payment';

const paymentStore = usePaymentStore();

const canProcessPayment = computed(
  () =>
    paymentStore.paymentAmount > 0 &&
    paymentStore.currentLocation !== null &&
    (paymentStore.currentCalculation?.total || 0) >= MINIMUM_PAYMENT_AMOUNT,
);

const processPayment = () => {
  if (!canProcessPayment.value || !paymentStore.currentLocation) return;

  const paymentData: PaymentData = {
    amount: paymentStore.paymentAmount,
    method: 'cash',
    locationId: paymentStore.currentLocation.id,
  };

  paymentStore.processCashPayment(paymentData);
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
