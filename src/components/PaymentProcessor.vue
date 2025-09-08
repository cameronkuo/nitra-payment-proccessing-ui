<template>
  <div class="p-5">
    <div class="flex items-center gap-5 mb-5">
      <h5 class="font-bold!">Collect Payment</h5>
      <!-- Location Selector -->
      <q-select
        v-model="paymentStore.selectedLocation"
        emit-value
        filled
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

    <!-- Payment Form State -->
    <div
      v-if="paymentStore.paymentState === 'form'"
      class="grid sm:grid-cols-[1fr_auto] border border-gray-300 rounded-lg"
    >
      <!-- Amount Input -->
      <div class="sm:row-span-2 p-5 border-r border-gray-300 flex flex-col items-center">
        <p class="text-gray-700">Enter Amount</p>
        <div class="flex font-bold">
          <span class="text-2xl">$</span>
          <BigNumberInput
            class="text-5xl min-w-5 outline-none"
            :model-value="paymentStore.paymentAmount"
            @update:model-value="onAmountChange"
          />
        </div>
        <!-- FIXME: missing field for payment description -->
      </div>

      <!-- Summary Title -->
      <div class="p-5 border-b border-gray-300">
        <h6 class="font-bold!">Summary</h6>
      </div>

      <!-- Payment Content -->
      <div class="p-5 w-96">
        <!-- Payment Method Selection -->
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
    <div
      v-if="
        paymentStore.paymentState === 'confirmation' &&
        paymentStore.lastPaymentData &&
        paymentStore.lastCalculation
      "
    >
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

import BigNumberInput from './BigNumberInput.vue';
import CardPayment from './CardPayment.vue';
import CashPayment from './CashPayment.vue';
import PaymentConfirmation from './PaymentConfirmation.vue';

const paymentStore = usePaymentStore();

const onAmountChange = (value: number | null) => {
  paymentStore.setPaymentAmount(value || 0);
};

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
