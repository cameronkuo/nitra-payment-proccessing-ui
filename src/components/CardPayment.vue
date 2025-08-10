<template>
  <div class="card-payment">
    <div class="row q-gutter-md">
      <!-- Amount Input -->
      <div class="col-12">
        <q-input
          filled
          label="Payment Amount"
          min="0"
          :model-value="amount"
          prefix="$"
          :rules="[(val) => val > 0 || 'Amount must be greater than 0']"
          step="0.01"
          type="number"
          @update:model-value="onAmountChange"
        />
      </div>

      <!-- Processing Fee Configuration -->
      <div v-if="amount > 0" class="col-12">
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
              <span>{{ formatCurrency(totalProcessingFee) }}</span>
            </div>
            <div class="summary-row text-negative">
              <span>Merchant Fee:</span>
              <span>{{ formatCurrency(calculatedMerchantFee) }}</span>
            </div>
            <div class="summary-row text-negative">
              <span>Patient Fee:</span>
              <span>{{ formatCurrency(calculatedPatientFee) }}</span>
            </div>
          </div>
        </q-card>
      </div>

      <!-- Payment Method Selection -->
      <div v-if="amount > 0" class="col-12">
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
      <div v-if="paymentType === 'reader' && amount > 0" class="col-12">
        <q-select
          v-model="selectedReader"
          emit-value
          filled
          label="Select Card Reader"
          map-options
          option-label="label"
          option-value="id"
          :options="readers"
          :option-disable="(opt) => opt.status === 'offline'"
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
                    size="sm"
                    color="grey-4"
                    text-color="grey-7"
                  >
                    Offline
                  </q-chip>
                </q-item-label>
                <q-item-label caption :class="scope.opt.status === 'offline' ? 'text-grey-4' : ''">
                  {{ scope.opt.readerId }}
                </q-item-label>
              </q-item-section>
            </q-item>
          </template>
        </q-select>

        <div v-if="!hasOnlineReaders" class="text-center q-mt-md">
          <q-icon color="warning" name="fas fa-exclamation-triangle" size="md" />
          <div class="text-body2 text-warning q-mt-sm">
            No online card readers available for this location
          </div>
        </div>
      </div>

      <!-- Manual Card Entry -->
      <div v-if="paymentType === 'manual' && amount > 0" class="col-12">
        <q-card bordered class="q-pa-md" flat>
          <div class="text-subtitle2 q-mb-md">Card Details</div>

          <div class="row q-gutter-md">
            <div class="col-12">
              <q-input
                v-model="cardDetails.number"
                fill-mask
                filled
                label="Card Number"
                mask="#### #### #### ####"
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
                fill-mask
                filled
                label="Expiry Month"
                mask="##"
                :rules="expiryMonthRules"
              />
            </div>

            <div class="col-6">
              <q-input
                v-model="cardDetails.expiryYear"
                fill-mask
                filled
                label="Expiry Year"
                mask="##"
                :rules="expiryYearRules"
              />
            </div>

            <div class="col-12">
              <q-input
                v-model="cardDetails.cvv"
                fill-mask
                filled
                label="CVV"
                mask="###"
                :rules="[(val) => !!val || 'CVV is required']"
                type="password"
              />
            </div>
          </div>
        </q-card>
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

            <div class="summary-row">
              <span>Processing Fee:</span>
              <span>{{ formatCurrency(calculation.processingFee) }}</span>
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
          <q-icon name="fas fa-exclamation-triangle" class="q-mr-sm" />
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
          <q-icon class="q-mr-sm" name="fas fa-credit-card" />
          Process Card Payment
        </q-btn>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, h, reactive, ref } from 'vue';

import { CommonEvent } from 'src/enums/emitter';
import { eventEmitter } from 'src/utils/event-emitter';
import {
  calculatePaymentTotals,
  formatCurrency,
  formatPercentage,
} from 'src/utils/payment-calculations';

import EditMerchantProcessingFee from './EditMerchantProcessingFee.vue';

import type {
  Location,
  Organization,
  PaymentData,
  PaymentReader,
  ProcessingFeeConfig,
} from 'src/types/payment';

interface Props {
  location: Location | null;
  readers: PaymentReader[];
  organization: Organization;
  amount: number;
}

interface Emits {
  (e: 'update:amount', value: number): void;
  (e: 'process-payment', data: PaymentData): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const paymentType = ref<'reader' | 'manual'>('reader');
const selectedReader = ref<number | null>(null);

const feeConfig = ref<ProcessingFeeConfig>({
  merchantFixed: 5,
  merchantPercentage: 1.5,
  patientFixed: 5,
  patientPercentage: 2.0,
});

const cardDetails = reactive({
  number: '',
  cardholderName: '',
  expiryMonth: '',
  expiryYear: '',
  cvv: '',
});

const totalProcessingFee = computed(() => {
  const fixedFee = props.organization.totalProcessingFeeFixed;
  const percentageFee = parseFloat(props.organization.totalProcessingFeePercentage) * props.amount;
  return fixedFee + percentageFee;
});

const calculatedMerchantFee = computed(
  () => feeConfig.value.merchantFixed + (feeConfig.value.merchantPercentage * props.amount) / 100,
);

const calculatedPatientFee = computed(
  () => feeConfig.value.patientFixed + (feeConfig.value.patientPercentage * props.amount) / 100,
);

const calculation = computed(() => {
  if (!props.location || props.amount <= 0) {
    return {
      subtotal: 0,
      tax: 0,
      processingFee: 0,
      merchantFee: 0,
      patientFee: 0,
      total: 0,
    };
  }

  return calculatePaymentTotals(props.amount, props.location, props.organization, feeConfig.value);
});

const hasOnlineReaders = computed(() => props.readers.some((reader) => reader.status === 'online'));

const canProcessPayment = computed(() => {
  const baseRequirements = props.amount > 0 && props.location !== null && calculation.value.total >= 0.5;

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
  emit('update:amount', numValue);
};

const openFeeDialog = () => {
  eventEmitter.emit(CommonEvent.OPEN_DIALOG, {
    title: '',
    showClose: false,
    children: () =>
      h(EditMerchantProcessingFee, {
        paymentAmount: props.amount,
        organization: props.organization,
        initialConfig: feeConfig.value,
        onSave: (config: ProcessingFeeConfig) => {
          feeConfig.value = config;
          eventEmitter.emit(CommonEvent.CLOSE_DIALOG);
        },
        onClose: () => {
          eventEmitter.emit(CommonEvent.CLOSE_DIALOG);
        },
      }),
  });
};

const processPayment = () => {
  if (!canProcessPayment.value || !props.location) return;

  const paymentData: PaymentData = {
    amount: props.amount,
    method: 'card',
    locationId: props.location.id,
  };

  if (paymentType.value === 'reader' && selectedReader.value) {
    const reader = props.readers.find((r) => r.id === selectedReader.value);
    if (reader && reader.status === 'online') {
      paymentData.readerId = reader.readerId;
    } else {
      // Should not happen due to validation, but safety check
      return;
    }
  } else if (paymentType.value === 'manual') {
    paymentData.cardDetails = { ...cardDetails };
  }

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

.fee-summary .summary-row {
  font-size: 0.875rem;
}
</style>
