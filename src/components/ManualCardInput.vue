<template>
  <div class="manual-card-input q-pa-lg">
    <!-- Card Input Illustration -->
    <div class="text-center q-mb-lg">
      <div class="card-illustration q-mb-md">
        <q-icon color="primary" name="fas fa-credit-card" size="6rem" />
        <!-- Card details form overlay -->
        <div class="card-form-overlay">
          <div class="form-lines"></div>
          <div class="form-lines"></div>
          <div class="form-lines"></div>
        </div>
      </div>
    </div>

    <!-- Review Details Section -->
    <div class="review-section q-mb-lg">
      <div class="row items-center q-mb-md">
        <q-icon class="q-mr-sm" name="fas fa-keyboard" />
        <span class="text-h6">Input Card Details Manually</span>
      </div>
      
      <p class="text-body2 text-grey-7 q-mb-md">
        Enter the card details below and review the payment summary before processing.
      </p>
    </div>

    <!-- Card Details Form -->
    <div class="card-form q-mb-lg">
      <q-card bordered flat>
        <q-card-section>
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

            <div class="col-12">
              <q-select
                v-model="cardDetails.country"
                emit-value
                filled
                label="Country"
                map-options
                option-label="name"
                option-value="code"
                :options="countryOptions"
                :rules="[(val) => !!val || 'Country is required']"
              />
            </div>

            <div class="col-12">
              <q-input
                v-model="cardDetails.zipcode"
                filled
                label="ZIP Code"
                maxlength="10"
                :rules="zipcodeRules"
              />
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>

    <!-- Payment Summary -->
    <div class="payment-summary q-mb-lg">
      <q-card class="bg-grey-1" flat>
        <q-card-section>
          <div class="text-subtitle2 q-mb-sm">Payment Summary</div>
          <div class="summary-row">
            <span>Amount:</span>
            <span>{{ formatCurrency(paymentData.amount) }}</span>
          </div>
          <div class="summary-row">
            <span>Total:</span>
            <span class="text-weight-bold">{{ formatCurrency(calculation.total) }}</span>
          </div>
        </q-card-section>
      </q-card>
    </div>

    <!-- Action Buttons -->
    <div class="row q-gutter-md">
      <q-btn
        class="col"
        color="grey-7"
        flat
        label="Cancel"
        @click="cancelPayment"
      />
      <q-btn
        class="col"
        color="primary"
        :disabled="!isValidCardDetails"
        label="Process Payment"
        @click="processPayment"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue';

import { formatCurrency } from 'src/utils/payment-calculations';

import type { PaymentData, PaymentCalculation } from 'src/types/payment';

interface Props {
  paymentData: PaymentData;
  calculation: PaymentCalculation;
}

interface Emits {
  (e: 'process-payment', cardDetails: {
    number: string;
    cardholderName: string;
    expiryMonth: string;
    expiryYear: string;
    cvv: string;
    country: string;
    zipcode: string;
  }): void;
  (e: 'cancel'): void;
}

defineProps<Props>();
const emit = defineEmits<Emits>();

const cardDetails = reactive({
  number: '',
  cardholderName: '',
  expiryMonth: '',
  expiryYear: '',
  cvv: '',
  country: '',
  zipcode: '',
});

const countryOptions = [
  { code: 'US', name: 'United States' },
  { code: 'CA', name: 'Canada' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'AU', name: 'Australia' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'IT', name: 'Italy' },
  { code: 'ES', name: 'Spain' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'BE', name: 'Belgium' },
  { code: 'CH', name: 'Switzerland' },
  { code: 'AT', name: 'Austria' },
  { code: 'SE', name: 'Sweden' },
  { code: 'NO', name: 'Norway' },
  { code: 'DK', name: 'Denmark' },
  { code: 'FI', name: 'Finland' },
];

const zipcodeRules = [
  (val: string) => !!val || 'ZIP code is required',
  (val: string) => {
    if (cardDetails.country === 'US') {
      return /^\d{5}(-\d{4})?$/.test(val) || 'US ZIP code must be in format 12345 or 12345-6789';
    } else if (cardDetails.country === 'CA') {
      return /^[A-Za-z]\d[A-Za-z] ?\d[A-Za-z]\d$/.test(val) || 'Canadian postal code must be in format A1A 1A1';
    } else if (cardDetails.country === 'GB') {
      return /^[A-Za-z]{1,2}\d[A-Za-z\d]? ?\d[A-Za-z]{2}$/.test(val) || 'UK postcode must be in valid format';
    }
    return val.length >= 3 || 'ZIP code must be at least 3 characters';
  },
];

const isValidCardDetails = computed(() => {
  return (
    cardDetails.number.replace(/\s/g, '').length >= 16 &&
    cardDetails.cardholderName.length > 0 &&
    cardDetails.expiryMonth.length === 2 &&
    cardDetails.expiryYear.length === 2 &&
    cardDetails.cvv.length >= 3 &&
    cardDetails.country.length > 0 &&
    cardDetails.zipcode.length >= 3
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

const processPayment = () => {
  if (!isValidCardDetails.value) return;
  
  emit('process-payment', {
    number: cardDetails.number,
    cardholderName: cardDetails.cardholderName,
    expiryMonth: cardDetails.expiryMonth.padStart(2, '0'),
    expiryYear: cardDetails.expiryYear.padStart(2, '0'),
    cvv: cardDetails.cvv,
    country: cardDetails.country,
    zipcode: cardDetails.zipcode,
  });
};

const cancelPayment = () => {
  emit('cancel');
};
</script>

<style scoped>
.manual-card-input {
  min-width: 400px;
  max-width: 500px;
}

.card-illustration {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.card-form-overlay {
  width: 60px;
  height: 40px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  position: relative;
  margin-top: -10px;
  padding: 4px;
}

.form-lines {
  height: 2px;
  background: #eee;
  margin-bottom: 3px;
  border-radius: 1px;
}

.form-lines:last-child {
  margin-bottom: 0;
}

.review-section {
  text-align: center;
}

.card-form .q-card {
  border: 1px solid #e0e0e0;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2px 0;
}
</style>