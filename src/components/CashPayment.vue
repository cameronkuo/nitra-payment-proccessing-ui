<template>
  <hr />
  <div v-if="paymentStore.paymentAmount > 0 && paymentStore.currentLocation">
    <!-- Total Amount Summary -->
    <div class="flex items-center">
      <span class="font-bold">Pay by Cash Total</span>
      <div class="flex-1" />
      <span
        class="font-bold text-xl"
        :class="[
          (paymentStore.currentCalculation?.total || 0) < MINIMUM_PAYMENT_AMOUNT
            ? 'text-red'
            : 'text-green',
        ]"
      >
        {{ formatCurrency(paymentStore.currentCalculation?.total) }}
      </span>
    </div>

    <!-- Minimum Amount Error -->
    <span
      v-if="(paymentStore.currentCalculation?.total || 0) < MINIMUM_PAYMENT_AMOUNT"
      class="text-red"
    >
      Total amount falls below the required minimum of
      {{ MINIMUM_PAYMENT_AMOUNT_FORMATTED }}
    </span>
  </div>

  <hr class="border-gray-300" />

  <!-- Location Selector -->
  <q-select
    v-model="paymentStore.selectedLocation"
    borderless
    class="w-fit"
    dense
    emit-value
    map-options
    option-label="name"
    option-value="id"
    :options="paymentStore.locations"
    @update:model-value="paymentStore.setLocation"
  >
    <template #prepend>
      <q-icon class="text-sm" name="fa-solid fa-location-dot" />
    </template>
    <template #selected-item="scope">
      <span>{{ scope.opt.name }}</span>
    </template>
    <template #option="scope">
      <q-item v-bind="scope.itemProps">
        <q-item-section>
          <q-item-label>{{ scope.opt.name }}</q-item-label>
          <q-item-label caption>
            Tax Rate: {{ (parseFloat(scope.opt.taxRate) * 100).toFixed(2) }}%
          </q-item-label>
        </q-item-section>
      </q-item>
    </template>
  </q-select>

  <!-- Process Payment Button -->
  <q-btn class="full-width" color="orange-6" :disabled="!canProcessPayment" @click="processPayment">
    <q-icon class="q-mr-sm" name="fas fa-money-bill-wave" />
    Log Payment
  </q-btn>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import { MINIMUM_PAYMENT_AMOUNT, MINIMUM_PAYMENT_AMOUNT_FORMATTED } from 'src/constants/payment';
import { usePaymentStore } from 'src/stores/payment-store';
import { formatCurrency } from 'src/utils/payment-calculations';

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
