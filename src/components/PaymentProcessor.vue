<template>
  <div class="p-5">
    <div class="flex items-center gap-5 mb-5">
      <h5 class="font-bold!">Collect Payment</h5>
      <!-- Location Selector -->
      <q-select
        v-model="paymentStore.selectedLocation"
        dense
        emit-value
        filled
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
    </div>

    <!-- Payment Form State -->
    <div
      v-if="paymentStore.paymentState === 'form'"
      class="grid md:grid-cols-[1fr_auto] border border-gray-300 rounded-lg"
    >
      <!-- Amount Input -->
      <div class="md:row-span-2 p-5 border-r border-gray-300 flex flex-col items-center">
        <p class="text-gray-700">Enter Amount</p>
        <div class="flex font-bold">
          <span class="text-2xl">$</span>
          &nbsp;
          <BigNumberInput
            class="text-5xl min-w-5 outline-none"
            :min="0"
            :model-value="paymentStore.paymentAmount"
            :step="0.01"
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
      <div class="p-5 md:max-w-md space-y-5">
        <!-- Summary Content -->
        <div class="grid grid-cols-[auto_1fr_auto] gap-2 mb-4 text-gray-700">
          <span>Subtotal</span>
          <div />
          <span>{{ formatCurrency(paymentStore.currentCalculation?.subtotal) }}</span>
          <span>Tax({{ numeral(paymentStore.currentLocation?.taxRate).format('0.00%') }})</span>
          <div />
          <span>{{ formatCurrency(paymentStore.currentCalculation?.tax) }}</span>
        </div>

        <hr />

        <div class="grid grid-cols-[auto_1fr_auto] gap-2 mb-4">
          <span>Total:</span>
          <div />
          <span>{{ formatCurrency(paymentStore.currentCalculation?.total) }}</span>
        </div>

        <!-- Payment Method Selection -->
        <q-btn-toggle
          v-model="paymentStore.paymentMethod"
          class="border border-teal-100"
          color="white"
          no-caps
          no-wrap
          :options="[
            { label: 'Cash Payment', value: 'cash', icon: 'fa-solid fa-sack-dollar text-sm' },
            { label: 'Card Payment', value: 'card', icon: 'fa-solid fa-credit-card text-sm' },
          ]"
          spread
          text-color="teal-9"
          toggle-color="teal-100"
          toggle-text-color="teal-9"
          unelevated
          @update:model-value="paymentStore.setPaymentMethod"
        />

        <!-- Cash Payment -->
        <template v-if="paymentStore.paymentMethod === 'cash'">
          <CashPayment />
        </template>

        <!-- Card Payment -->
        <template v-if="paymentStore.paymentMethod === 'card'">
          <CardPayment />
        </template>
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
import numeral from 'numeral';
import { onMounted } from 'vue';

import { usePaymentStore } from 'src/stores/payment-store';
import { formatCurrency } from 'src/utils/payment-calculations';

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
