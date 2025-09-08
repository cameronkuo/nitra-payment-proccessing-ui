<template>
  <!-- Processing Fee Configuration -->
  <template v-if="paymentStore.paymentAmount > 0">
    <div class="flex items-center gap-2">
      <span>Patient Card Processing Fee</span>
      <button class="underline text-primary cursor-pointer" @click="openFeeDialog">Edit</button>
      <div class="flex-1" />
      <span>{{ formatCurrency(paymentStore.calculatedPatientFee) }}</span>
    </div>
  </template>

  <hr />

  <!-- Total Amount Summary -->
  <div v-if="paymentStore.paymentAmount > 0">
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

  <!-- Card Reader Selection -->
  <q-select
    v-model="selectedReader"
    emit-value
    filled
    label="Select Card Reader"
    map-options
    :option-disable="(opt) => opt.status === 'offline'"
    option-label="label"
    option-value="id"
    :options="paymentStore.availableReaders"
  >
    <template #selected-item="scope">
      <span>{{ scope.opt.label }}</span>
    </template>
    <template #option="scope">
      <q-item v-bind="scope.itemProps">
        <q-item-section avatar>
          <q-icon
            :color="scope.opt.status === 'online' ? 'green' : 'grey'"
            :name="scope.opt.status === 'online' ? 'fas fa-circle' : 'fas fa-circle'"
          />
        </q-item-section>
        <q-item-section>
          <q-item-label :class="scope.opt.status === 'offline' ? 'text-grey-5' : ''">
            {{ scope.opt.label }}
            <q-chip
              v-if="scope.opt.status === 'offline'"
              color="grey-4"
              size="sm"
              text-color="grey-7"
            >
              Offline
            </q-chip>
          </q-item-label>
          <q-item-label caption> Reader ID: {{ scope.opt.readerId }} </q-item-label>
        </q-item-section>
      </q-item>
    </template>
  </q-select>

  <!-- Process Payment Button -->
  <q-btn
    class="full-width"
    color="orange-6"
    :disabled="!canProcessPayment || !selectedReader"
    @click="initiateReaderPayment"
  >
    <q-icon class="q-mr-sm" name="fa-solid fa-keyboard" />
    Initiate Payment on Reader
  </q-btn>
  <div />
  <q-btn
    class="full-width"
    color="orange-1"
    :disabled="!canProcessPayment"
    text-color="orange-6"
    @click="initiateManualCardInput"
  >
    <q-icon class="q-mr-sm" name="fa-solid fa-credit-card" />
    Input Card Number Manually
  </q-btn>
</template>

<script setup lang="ts">
import { computed, h, ref } from 'vue';

import { MINIMUM_PAYMENT_AMOUNT, MINIMUM_PAYMENT_AMOUNT_FORMATTED } from 'src/constants/payment';
import { CommonEvent } from 'src/enums/emitter';
import { usePaymentStore } from 'src/stores/payment-store';
import { eventEmitter } from 'src/utils/event-emitter';
import { formatCurrency } from 'src/utils/payment-calculations';

import EditMerchantProcessingFee from './EditMerchantProcessingFee.vue';
import InitiatePaymentOnReader from './InitiatePaymentOnReader.vue';
import ManualCardInput from './ManualCardInput.vue';

import type { PaymentData, ProcessingFeeConfig } from 'src/types/payment';

const paymentStore = usePaymentStore();

const selectedReader = ref<number | null>(null);

const hasOnlineReaders = computed(() =>
  paymentStore.availableReaders.some((reader) => reader.status === 'online'),
);

const canProcessPayment = computed(() => {
  return (
    paymentStore.paymentAmount > 0 &&
    paymentStore.currentLocation !== null &&
    (paymentStore.currentCalculation?.total || 0) >= MINIMUM_PAYMENT_AMOUNT &&
    hasOnlineReaders.value
  );
});

const openFeeDialog = () => {
  eventEmitter.emit(CommonEvent.OPEN_DIALOG, {
    title: 'Edit Merchant Processing Fee',
    children: () =>
      h(EditMerchantProcessingFee, {
        paymentAmount: paymentStore.paymentAmount,
        organization: paymentStore.organization,
        initialConfig: paymentStore.processingFeeConfig,
        onSave: (config: ProcessingFeeConfig) => {
          paymentStore.setProcessingFeeConfig(config);
          eventEmitter.emit(CommonEvent.CLOSE_DIALOG);
        },
        onClose: () => {
          eventEmitter.emit(CommonEvent.CLOSE_DIALOG);
        },
      }),
  });
};

const initiateReaderPayment = () => {
  if (!canProcessPayment.value || !paymentStore.currentLocation || selectedReader.value === null)
    return;

  const selectedReaderObj = paymentStore.availableReaders.find(
    (r) => r.id === selectedReader.value,
  );
  if (!selectedReaderObj) return;

  eventEmitter.emit(CommonEvent.OPEN_DIALOG, {
    title: '',
    showClose: false,
    children: () =>
      h(InitiatePaymentOnReader, {
        paymentData: {
          amount: paymentStore.paymentAmount,
          method: 'card' as const,
          locationId: paymentStore.currentLocation?.id || 0,
          readerId: selectedReader.value?.toString() || '',
          processingFeeConfig: paymentStore.processingFeeConfig,
        },
        reader: selectedReaderObj,
        calculation: paymentStore.currentCalculation || {
          subtotal: 0,
          tax: 0,
          processingFee: 0,
          merchantFee: 0,
          patientFee: 0,
          total: 0,
        },
        'onProcess-payment': () => {
          processPayment();
          eventEmitter.emit(CommonEvent.CLOSE_DIALOG);
        },
      }),
  });
};

const initiateManualCardInput = () => {
  if (!paymentStore.currentLocation) return;

  eventEmitter.emit(CommonEvent.OPEN_DIALOG, {
    title: '',
    showClose: false,
    children: () =>
      h(ManualCardInput, {
        paymentData: {
          amount: paymentStore.paymentAmount,
          method: 'card' as const,
          locationId: paymentStore.currentLocation?.id || 0,
          processingFeeConfig: paymentStore.processingFeeConfig,
        },
        calculation: paymentStore.currentCalculation || {
          subtotal: 0,
          tax: 0,
          processingFee: 0,
          merchantFee: 0,
          patientFee: 0,
          total: 0,
        },
        'onProcess-payment': (cardDetails) => {
          processManualCardPayment(cardDetails);
          eventEmitter.emit(CommonEvent.CLOSE_DIALOG);
        },
        onCancel: () => {
          eventEmitter.emit(CommonEvent.CLOSE_DIALOG);
        },
      }),
  });
};

const processManualCardPayment = (cardDetails: {
  number: string;
  cardholderName: string;
  expirationDate: string;
  cvv: string;
  country: string;
  zipcode: string;
}) => {
  if (!paymentStore.currentLocation) return;

  const expirationParts = cardDetails.expirationDate.split('/');
  const expiryMonth = expirationParts[0] || '';
  const expiryYear = expirationParts[1] || '';
  
  const paymentData: PaymentData = {
    amount: paymentStore.paymentAmount,
    method: 'card',
    locationId: paymentStore.currentLocation.id,
    processingFeeConfig: paymentStore.processingFeeConfig,
    cardDetails: {
      ...cardDetails,
      expiryMonth: expiryMonth.padStart(2, '0'),
      expiryYear: expiryYear.padStart(2, '0'),
    },
  };

  paymentStore.processCardPayment(paymentData);
};

const processPayment = () => {
  if (!canProcessPayment.value || !paymentStore.currentLocation || !selectedReader.value) return;

  const paymentData: PaymentData = {
    amount: paymentStore.paymentAmount,
    method: 'card',
    locationId: paymentStore.currentLocation.id,
    processingFeeConfig: paymentStore.processingFeeConfig,
    readerId: selectedReader.value.toString(),
  };

  paymentStore.processCardPayment(paymentData);
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

.fee-summary .summary-row {
  font-size: 14px;
}

.card-payment .q-card {
  border: 1px solid #e0e0e0;
}
</style>
