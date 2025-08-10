<template>
  <div class="initiate-payment-reader q-pa-lg">
    <!-- Card Reader Illustration -->
    <div class="text-center q-mb-lg">
      <div class="reader-illustration q-mb-md">
        <q-icon name="fas fa-credit-card" size="6rem" color="primary" />
        <!-- Receipt paper illustration -->
        <div class="receipt-paper">
          <div class="receipt-lines"></div>
          <div class="receipt-lines"></div>
          <div class="receipt-lines"></div>
        </div>
      </div>
    </div>

    <!-- Review Details Section -->
    <div class="review-section q-mb-lg">
      <div class="row items-center q-mb-md">
        <q-icon name="fas fa-eye" class="q-mr-sm" />
        <span class="text-h6">Review Details with Patient</span>
      </div>
      
      <p class="text-body2 text-grey-7 q-mb-md">
        Review details of this transaction with the customer on the device reader. 
        If everything looks good, proceed to process payment.
      </p>
    </div>

    <!-- Auto-Processing Section -->
    <div class="auto-processing-section q-mb-lg">
      <q-card flat bordered class="auto-process-card">
        <q-card-section class="text-center">
          <div class="text-body1 q-mb-sm">
            Auto-Processing in {{ countdown }}s
          </div>
          <q-linear-progress 
            :value="progressValue" 
            color="primary" 
            size="8px" 
            rounded 
            class="q-mb-sm"
          />
          <div class="text-caption text-grey-6">
            Or click "Process Payment" below
          </div>
        </q-card-section>
      </q-card>
    </div>

    <!-- Reader Information -->
    <div class="reader-info q-mb-lg">
      <q-card flat class="bg-grey-1">
        <q-card-section>
          <div class="text-subtitle2 q-mb-sm">Selected Reader</div>
          <div class="row items-center">
            <q-icon name="fas fa-circle" color="green" size="sm" class="q-mr-sm" />
            <div>
              <div class="text-body2">{{ readerLabel }}</div>
              <div class="text-caption text-grey-6">{{ readerId }}</div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>

    <!-- Payment Summary -->
    <div class="payment-summary q-mb-lg">
      <q-card flat class="bg-grey-1">
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
        color="grey-7"
        label="Cancel"
        flat
        class="col"
        @click="cancelPayment"
      />
      <q-btn
        color="primary"
        label="Process Payment"
        class="col"
        @click="processPayment"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';

import { formatCurrency } from 'src/utils/payment-calculations';

import type { PaymentData, PaymentCalculation, PaymentReader } from 'src/types/payment';

interface Props {
  paymentData: PaymentData;
  calculation: PaymentCalculation;
  reader: PaymentReader;
}

interface Emits {
  (e: 'process-payment'): void;
  (e: 'cancel'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const countdown = ref(5);
const countdownInterval = ref<NodeJS.Timeout | null>(null);

const progressValue = computed(() => (5 - countdown.value) / 5);

const readerLabel = computed(() => props.reader.label);
const readerId = computed(() => props.reader.readerId);

const startCountdown = () => {
  countdownInterval.value = setInterval(() => {
    countdown.value--;
    if (countdown.value <= 0) {
      processPayment();
    }
  }, 1000);
};

const stopCountdown = () => {
  if (countdownInterval.value) {
    clearInterval(countdownInterval.value);
    countdownInterval.value = null;
  }
};

const processPayment = () => {
  stopCountdown();
  emit('process-payment');
};

const cancelPayment = () => {
  stopCountdown();
  emit('cancel');
};

onMounted(() => {
  startCountdown();
});

onUnmounted(() => {
  stopCountdown();
});
</script>

<style scoped>
.initiate-payment-reader {
  min-width: 400px;
  max-width: 500px;
}

.reader-illustration {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.receipt-paper {
  width: 40px;
  height: 60px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 0 0 4px 4px;
  position: relative;
  margin-top: -10px;
  padding: 4px;
}

.receipt-lines {
  height: 2px;
  background: #eee;
  margin-bottom: 3px;
  border-radius: 1px;
}

.receipt-lines:last-child {
  margin-bottom: 0;
}

.review-section {
  text-align: center;
}

.auto-process-card {
  background: #e8f5e8;
  border: 1px solid #c8e6c9;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2px 0;
}
</style>