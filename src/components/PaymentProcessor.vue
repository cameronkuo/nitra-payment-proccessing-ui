<template>
  <div class="payment-processor q-pa-lg">
    <!-- Payment Form State -->
    <div v-if="paymentStore.paymentState === 'form'" class="row q-gutter-md">
      <!-- Location Selector -->
      <div class="col-12">
        <q-select
          v-model="paymentStore.selectedLocation"
          emit-value
          filled
          label="Select Location"
          map-options
          option-label="name"
          option-value="id"
          :options="paymentStore.locations"
          @update:model-value="paymentStore.setLocation"
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
          v-model="paymentStore.paymentMethod"
          color="white"
          no-caps
          :options="[
            { label: 'Cash Payment', value: 'cash', icon: 'fas fa-money-bill' },
            { label: 'Card Payment', value: 'card', icon: 'fas fa-credit-card' },
          ]"
          rounded
          spread
          text-color="grey-8"
          toggle-color="primary"
          unelevated
          @update:model-value="paymentStore.setPaymentMethod"
        />
      </div>

      <!-- Payment Content -->
      <div class="col-12">
        <!-- Cash Payment -->
        <div v-if="paymentStore.paymentMethod === 'cash'" class="q-pa-md">
          <CashPayment />
        </div>

        <!-- Card Payment -->
        <div v-if="paymentStore.paymentMethod === 'card'" class="q-pa-md">
          <CardPayment />
        </div>
      </div>
    </div>

    <!-- Payment Confirmation State -->
    <div v-if="paymentStore.paymentState === 'confirmation' && paymentStore.lastPaymentData && paymentStore.lastCalculation">
      <PaymentConfirmation
        :calculation="paymentStore.lastCalculation"
        :location="paymentStore.currentLocation"
        :payment-data="paymentStore.lastPaymentData"
        :readers="paymentStore.readers"
        :transaction-id="paymentStore.generateTransactionId()"
        @new-payment="paymentStore.startNewPayment"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';

import { usePaymentStore } from 'src/stores/payment-store';

import CardPayment from './CardPayment.vue';
import CashPayment from './CashPayment.vue';
import PaymentConfirmation from './PaymentConfirmation.vue';

const paymentStore = usePaymentStore();

onMounted(() => {
  paymentStore.initializeStore();
});
</script>

<style scoped>
.payment-processor {
  max-width: 800px;
  margin: 0 auto;
}
</style>
