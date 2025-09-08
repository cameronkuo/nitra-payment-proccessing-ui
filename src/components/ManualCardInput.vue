<template>
  <div class="w-lg max-w-full">
    <h5 class="font-bold">Credit Card Details</h5>

    <br />

    <!-- Card Details Form -->
    <q-card flat>
      <q-card-section class="p-0!">
        <div class="grid grid-cols-2 gap-y-1 gap-x-3">
          <div class="col-span-2">
            <q-input
              v-model="cardDetails.number"
              filled
              label="Card Number"
              mask="#### #### #### ####"
              maxlength="19"
              :rules="cardNumberRules"
            />
          </div>

          <div class="col-span-2">
            <q-input
              v-model="cardDetails.cardholderName"
              filled
              label="Cardholder Name"
              :rules="[(val) => !!val || 'Cardholder name is required']"
            />
          </div>

          <div class="col-span-1">
            <q-input
              v-model="cardDetails.expirationDate"
              filled
              label="Expiration Date"
              mask="##/##"
              maxlength="5"
              placeholder="MM/YY"
              :rules="expirationDateRules"
            />
          </div>

          <div class="col-span-1">
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

          <div class="col-span-1">
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

          <div class="col-span-1">
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

    <!-- Payment Summary -->

    <!-- Action Buttons -->
    <div class="flex gap-4">
      <q-btn class="flex-1" color="grey-7" flat label="Cancel" @click="cancelPayment" />
      <q-btn
        class="flex-1"
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

import type { PaymentCalculation, PaymentData } from 'src/types/payment';

interface Props {
  paymentData: PaymentData;
  calculation: PaymentCalculation;
}

interface Emits {
  (
    e: 'process-payment',
    cardDetails: {
      number: string;
      cardholderName: string;
      expirationDate: string;
      cvv: string;
      country: string;
      zipcode: string;
    },
  ): void;
  (e: 'cancel'): void;
}

defineProps<Props>();
const emit = defineEmits<Emits>();

const cardDetails = reactive({
  number: '',
  cardholderName: '',
  expirationDate: '',
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

const expirationDateRules = [
  (val: string) => !!val || 'Expiration date is required',
  (val: string) => {
    if (!val || val.length !== 5) return 'Expiration date must be in MM/YY format';
    const [monthStr, yearStr] = val.split('/');
    if (!monthStr || !yearStr || monthStr.length !== 2 || yearStr.length !== 2) {
      return 'Expiration date must be in MM/YY format';
    }
    const month = parseInt(monthStr);
    const year = parseInt(yearStr);
    if (month < 1 || month > 12) {
      return 'Month must be between 01 and 12';
    }
    const currentYear = new Date().getFullYear() % 100;
    const currentMonth = new Date().getMonth() + 1;
    if (year < currentYear || (year === currentYear && month < currentMonth)) {
      return 'Card has expired';
    }
    return true;
  },
];

const zipcodeRules = [
  (val: string) => !!val || 'ZIP code is required',
  (val: string) => {
    if (cardDetails.country === 'US') {
      return /^\d{5}(-\d{4})?$/.test(val) || 'US ZIP code must be in format 12345 or 12345-6789';
    } else if (cardDetails.country === 'CA') {
      return (
        /^[A-Za-z]\d[A-Za-z] ?\d[A-Za-z]\d$/.test(val) ||
        'Canadian postal code must be in format A1A 1A1'
      );
    } else if (cardDetails.country === 'GB') {
      return (
        /^[A-Za-z]{1,2}\d[A-Za-z\d]? ?\d[A-Za-z]{2}$/.test(val) ||
        'UK postcode must be in valid format'
      );
    }
    return val.length >= 3 || 'ZIP code must be at least 3 characters';
  },
];

const isValidCardDetails = computed(() => {
  const expirationValid =
    cardDetails.expirationDate.length === 5 &&
    cardDetails.expirationDate.includes('/') &&
    cardDetails.expirationDate.split('/').every((part) => part.length === 2);

  return (
    cardDetails.number.replace(/\s/g, '').length >= 16 &&
    cardDetails.cardholderName.length > 0 &&
    expirationValid &&
    cardDetails.cvv.length >= 3 &&
    cardDetails.country.length > 0 &&
    cardDetails.zipcode.length >= 3
  );
});

const cardNumberRules = [
  (val: string) => !!val || 'Card number is required',
  (val: string) => val.replace(/\s/g, '').length >= 16 || 'Card number must be at least 16 digits',
];

const processPayment = () => {
  if (!isValidCardDetails.value) return;

  emit('process-payment', {
    number: cardDetails.number,
    cardholderName: cardDetails.cardholderName,
    expirationDate: cardDetails.expirationDate,
    cvv: cardDetails.cvv,
    country: cardDetails.country,
    zipcode: cardDetails.zipcode,
  });
};

const cancelPayment = () => {
  emit('cancel');
};
</script>
