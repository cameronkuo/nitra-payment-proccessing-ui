<template>
  <div class="card-payment">
    <div class="row q-gutter-md">
      <!-- Amount Input -->
      <div class="col-12">
        <q-input
          filled
          label="Payment Amount"
          min="0"
          :model-value="paymentStore.paymentAmount"
          prefix="$"
          :rules="[(val) => val > 0 || 'Amount must be greater than 0']"
          step="0.01"
          type="number"
          @update:model-value="onAmountChange"
        />
      </div>

      <!-- Processing Fee Configuration -->
      <div v-if="paymentStore.paymentAmount > 0" class="col-12">
        <q-card bordered class="q-pa-md" flat>
          <div class="row items-center q-mb-sm">
            <div class="text-subtitle2">Processing Fee Configuration</div>
            <q-space />
            <q-btn
              color="primary"
              flat
              icon="fas fa-edit"
              label="Edit Fees"
              @click="openFeeDialog"
            />
          </div>

          <div class="fee-summary">
            <div class="summary-row">
              <span>Total Processing Fee:</span>
              <span>{{ formatCurrency(paymentStore.totalProcessingFee) }}</span>
            </div>
            <div class="summary-row text-negative">
              <span>Merchant Fee:</span>
              <span>{{ formatCurrency(paymentStore.calculatedMerchantFee) }}</span>
            </div>
            <div class="summary-row text-negative">
              <span>Patient Fee:</span>
              <span>{{ formatCurrency(paymentStore.calculatedPatientFee) }}</span>
            </div>
          </div>
        </q-card>
      </div>

      <!-- Payment Method Selection -->
      <div v-if="paymentStore.paymentAmount > 0" class="col-12">
        <q-btn-toggle
          v-model="paymentType"
          color="white"
          no-caps
          :options="[
            { label: 'Card Reader', value: 'reader', icon: 'fas fa-credit-card' },
            { label: 'Manual Entry', value: 'manual', icon: 'fas fa-keyboard' },
          ]"
          rounded
          spread
          text-color="grey-8"
          toggle-color="primary"
          unelevated
        />
      </div>

      <!-- Card Reader Selection -->
      <div v-if="paymentType === 'reader' && paymentStore.paymentAmount > 0" class="col-12">
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
      </div>

      <!-- Card Details Form -->
      <div v-if="paymentType === 'manual' && paymentStore.paymentAmount > 0" class="col-12">
        <q-card bordered class="q-pa-md" flat>
          <div class="text-subtitle2 q-mb-md">Card Details</div>

          <div class="row q-gutter-md">
            <div class="col-12">
              <q-input
                v-model="cardDetails.number"
                filled
                label="Card Number"
                mask="#### #### #### ####"
                maxlength="19"
                :rules="cardNumberRules"
              />
            </div>

            <div class="col-12">
              <q-input
                v-model="cardDetails.cardholderName"
                filled
                label="Cardholder Name"
                :rules="[(val) => !!val || 'Cardholder name is required']"
              />
            </div>

            <div class="col-6">
              <q-input
                v-model="cardDetails.expiryMonth"
                filled
                label="Expiry Month"
                mask="##"
                maxlength="2"
                placeholder="MM"
                :rules="expiryMonthRules"
              />
            </div>

            <div class="col-6">
              <q-input
                v-model="cardDetails.expiryYear"
                filled
                label="Expiry Year"
                mask="##"
                maxlength="2"
                placeholder="YY"
                :rules="expiryYearRules"
              />
            </div>

            <div class="col-12">
              <q-input
                v-model="cardDetails.cvv"
                filled
                label="CVV"
                mask="####"
                maxlength="4"
                :rules="[(val) => val.length >= 3 || 'CVV must be at least 3 digits']"
                type="password"
              />
            </div>
          </div>
        </q-card>
      </div>

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

            <div class="summary-row">
              <span>Processing Fee:</span>
              <span>{{ formatCurrency(paymentStore.currentCalculation?.patientFee || 0) }}</span>
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
          (paymentStore.currentCalculation?.total || 0) < 0.5
        "
        class="col-12"
      >
        <q-banner class="text-warning bg-orange-1">
          <q-icon class="q-mr-sm" name="fas fa-exclamation-triangle" />
          Total amount falls below the required minimum of $0.50
        </q-banner>
      </div>

      <!-- Process Payment Button -->
      <div class="col-12">
        <!-- Reader Payment Button -->
        <q-btn
          v-if="paymentType === 'reader'"
          class="full-width"
          color="primary"
          :disabled="!canProcessPayment"
          size="lg"
          @click="initiateReaderPayment"
        >
          <q-icon class="q-mr-sm" name="fas fa-credit-card" />
          Initiate Payment on Reader
        </q-btn>

        <!-- Manual Card Payment Button -->
        <q-btn
          v-else
          class="full-width"
          color="primary"
          :disabled="!canProcessPayment"
          size="lg"
          @click="processPayment"
        >
          <q-icon class="q-mr-sm" name="fas fa-keyboard" />
          Process Card Payment
        </q-btn>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, h, reactive, ref } from 'vue';

import { CommonEvent } from 'src/enums/emitter';
import { usePaymentStore } from 'src/stores/payment-store';
import { eventEmitter } from 'src/utils/event-emitter';
import { formatCurrency, formatPercentage } from 'src/utils/payment-calculations';

import EditMerchantProcessingFee from './EditMerchantProcessingFee.vue';
import InitiatePaymentOnReader from './InitiatePaymentOnReader.vue';

import type { PaymentData, ProcessingFeeConfig } from 'src/types/payment';

const paymentStore = usePaymentStore();

const paymentType = ref<'reader' | 'manual'>('reader');
const selectedReader = ref<number | null>(null);

const cardDetails = reactive({
  number: '',
  cardholderName: '',
  expiryMonth: '',
  expiryYear: '',
  cvv: '',
});

const hasOnlineReaders = computed(() =>
  paymentStore.availableReaders.some((reader) => reader.status === 'online'),
);

const canProcessPayment = computed(() => {
  const baseRequirements =
    paymentStore.paymentAmount > 0 &&
    paymentStore.currentLocation !== null &&
    (paymentStore.currentCalculation?.total || 0) >= 0.5;

  if (paymentType.value === 'reader') {
    return baseRequirements && selectedReader.value !== null && hasOnlineReaders.value;
  } else {
    return baseRequirements && isValidCardDetails.value;
  }
});

const isValidCardDetails = computed(() => {
  return (
    cardDetails.number.replace(/\s/g, '').length >= 16 &&
    cardDetails.cardholderName.length > 0 &&
    cardDetails.expiryMonth.length === 2 &&
    cardDetails.expiryYear.length === 2 &&
    cardDetails.cvv.length >= 3
  );
});

const cardNumberRules = [
  (val: string) => !!val || 'Card number is required',
  (val: string) => val.replace(/\s/g, '').length >= 16 || 'Card number must be at least 16 digits',
];

const expiryMonthRules = [
  (val: string) => !!val || 'Expiry month is required',
  (val: string) => {
    const month = parseInt(val);
    return (month >= 1 && month <= 12) || 'Month must be between 01 and 12';
  },
];

const expiryYearRules = [
  (val: string) => !!val || 'Expiry year is required',
  (val: string) => {
    const currentYear = new Date().getFullYear() % 100;
    const year = parseInt(val);
    return year >= currentYear || 'Card has expired';
  },
];

const onAmountChange = (value: string | number | null) => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value || 0;
  paymentStore.setPaymentAmount(numValue);
};

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

const processPayment = () => {
  if (!canProcessPayment.value || !paymentStore.currentLocation) return;

  const paymentData: PaymentData = {
    amount: paymentStore.paymentAmount,
    method: 'card',
    locationId: paymentStore.currentLocation.id,
    processingFeeConfig: paymentStore.processingFeeConfig,
  };

  if (paymentType.value === 'reader' && selectedReader.value) {
    paymentData.readerId = selectedReader.value.toString();
  } else if (paymentType.value === 'manual') {
    paymentData.cardDetails = {
      number: cardDetails.number,
      expiryMonth: cardDetails.expiryMonth.padStart(2, '0'),
      expiryYear: cardDetails.expiryYear.padStart(2, '0'),
      cvv: cardDetails.cvv,
      cardholderName: cardDetails.cardholderName,
    };
  }

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
