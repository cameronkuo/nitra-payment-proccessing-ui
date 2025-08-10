<template>
  <div class="payment-processor q-pa-lg">
    <!-- Payment Form State -->
    <div v-if="paymentState === 'form'" class="row q-gutter-md">
      <!-- Location Selector -->
      <div class="col-12">
        <q-select
          v-model="selectedLocation"
          emit-value
          filled
          label="Select Location"
          map-options
          option-label="name"
          option-value="id"
          :options="locations"
          @update:model-value="onLocationChange"
        >
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
      </div>

      <!-- Payment Method Selection -->
      <div class="col-12">
        <q-btn-toggle
          v-model="paymentMethod"
          spread
          no-caps
          rounded
          unelevated
          toggle-color="primary"
          color="white"
          text-color="grey-8"
          :options="[
            { label: 'Cash Payment', value: 'cash', icon: 'fas fa-money-bill' },
            { label: 'Card Payment', value: 'card', icon: 'fas fa-credit-card' },
          ]"
        />
      </div>

      <!-- Payment Content -->
      <div class="col-12">
        <!-- Cash Payment -->
        <div v-if="paymentMethod === 'cash'" class="q-pa-md">
          <CashPayment
            :amount="paymentAmount"
            :location="currentLocation"
            @process-payment="processCashPayment"
            @update:amount="paymentAmount = $event"
          />
        </div>

        <!-- Card Payment -->
        <div v-if="paymentMethod === 'card'" class="q-pa-md">
          <CardPayment
            :amount="paymentAmount"
            :location="currentLocation"
            :organization="organization"
            :readers="availableReaders"
            @process-payment="processCardPayment"
            @update:amount="paymentAmount = $event"
          />
        </div>
      </div>
    </div>

    <!-- Payment Confirmation State -->
    <div v-if="paymentState === 'confirmation' && lastPaymentData && lastCalculation">
      <PaymentConfirmation
        :calculation="lastCalculation"
        :location="currentLocation"
        :payment-data="lastPaymentData"
        :readers="readers"
        :transaction-id="generateTransactionId()"
        @new-payment="startNewPayment"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';

import locationsData from 'src/mock/locations.json';
import organizationData from 'src/mock/organization.json';
import readersData from 'src/mock/payment-location-readers.json';
import { calculatePaymentTotals } from 'src/utils/payment-calculations';

import CardPayment from './CardPayment.vue';
import CashPayment from './CashPayment.vue';
import PaymentConfirmation from './PaymentConfirmation.vue';

import type {
  Location,
  Organization,
  PaymentCalculation,
  PaymentData,
  PaymentReader,
  ProcessingFeeConfig,
} from 'src/types/payment';

const selectedLocation = ref<number | null>(null);
const paymentMethod = ref<'cash' | 'card'>('cash');
const paymentAmount = ref<number>(0);
const paymentState = ref<'form' | 'confirmation'>('form');
const lastPaymentData = ref<PaymentData | null>(null);
const lastCalculation = ref<PaymentCalculation | null>(null);

const locations = ref<Location[]>(locationsData);
const organization = ref<Organization>(organizationData);
const readers = ref<PaymentReader[]>(readersData);

const currentLocation = computed(
  () => locations.value.find((loc) => loc.id === selectedLocation.value) || null,
);

const availableReaders = computed(() =>
  readers.value.filter((reader) => reader.locationId === selectedLocation.value),
);

const onLocationChange = (locationId: number) => {
  selectedLocation.value = locationId;
};

const generateTransactionId = (): string => {
  return 'TXN_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
};

const processCashPayment = (paymentData: PaymentData) => {
  if (!currentLocation.value) return;

  const calculation = calculatePaymentTotals(paymentData.amount, currentLocation.value);

  lastPaymentData.value = paymentData;
  lastCalculation.value = calculation;
  paymentState.value = 'confirmation';
};

const processCardPayment = (paymentData: PaymentData) => {
  if (!currentLocation.value) return;

  // For card payments, we need the processing fee config
  // In a real app, this would come from the CardPayment component
  const defaultProcessingFeeConfig: ProcessingFeeConfig = {
    merchantFixed: 5,
    merchantPercentage: 1.5,
    patientFixed: 5,
    patientPercentage: 2.0,
  };

  const calculation = calculatePaymentTotals(
    paymentData.amount,
    currentLocation.value,
    organization.value,
    defaultProcessingFeeConfig,
  );

  lastPaymentData.value = paymentData;
  lastCalculation.value = calculation;
  paymentState.value = 'confirmation';
};

const startNewPayment = () => {
  paymentState.value = 'form';
  paymentAmount.value = 0;
  lastPaymentData.value = null;
  lastCalculation.value = null;
};

onMounted(() => {
  // Select first location by default
  if (locations.value.length > 0) {
    selectedLocation.value = locations.value[0]?.id ?? null;
  }
});
</script>

<style scoped>
.payment-processor {
  max-width: 800px;
  margin: 0 auto;
}
</style>
