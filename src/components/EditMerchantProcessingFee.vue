<template>
  <div class="edit-processing-fee q-pa-lg">
    <!-- Header -->
    <div class="row items-center justify-between q-mb-md">
      <div class="text-h5">Edit Merchant Processing Fee</div>
      <q-btn flat icon="close" round @click="$emit('close')" />
    </div>

    <div class="text-body2 text-grey-6 q-mb-lg">Only applies to this transaction</div>

    <!-- Slider Section -->
    <div class="slider-section q-mb-lg">
      <!-- Slider Tooltip -->
      <div class="slider-tooltip" :style="tooltipStyle">
        <div class="tooltip-percentage">{{ sliderValue.toFixed(2) }}%</div>
        <div class="tooltip-amount">{{ formatCurrency(merchantFeeAmount) }}</div>
      </div>

      <!-- Slider -->
      <q-slider
        v-model="sliderValue"
        class="fee-slider q-mb-md"
        color="primary"
        label-always
        :max="totalProcessingPercentage"
        :min="0"
        :step="0.01"
        thumb-color="white"
        track-color="grey-3"
      />

      <!-- Slider Labels -->
      <div class="slider-labels">
        <span>0</span>
        <span>{{ totalProcessingPercentage }}%</span>
      </div>
    </div>

    <!-- Fee Configuration -->
    <div class="fee-config-section q-mb-lg">
      <!-- Merchant Processing Fee -->
      <div class="fee-row q-mb-md">
        <div class="fee-label">Merchant processing fee</div>
        <div class="fee-inputs row q-gutter-sm items-center">
          <q-input
            v-model.number="merchantPercentage"
            class="percentage-input"
            dense
            :max="totalProcessingPercentage"
            min="0"
            outlined
            step="0.01"
            suffix="%"
            type="number"
            @update:model-value="updateFromMerchantPercentage"
          />
          <div class="text-grey-6">/ {{ totalProcessingPercentage }}% +</div>
          <div class="text-grey-6">$</div>
          <q-input
            v-model.number="merchantFixed"
            class="fixed-input"
            dense
            min="0"
            outlined
            step="0.01"
            type="number"
          />
          <div class="text-grey-6">/ $0.10</div>
        </div>
      </div>

      <!-- Patient Processing Fee -->
      <div class="fee-row q-mb-md">
        <div class="fee-label">Patient processing fee</div>
        <div class="fee-inputs row q-gutter-sm items-center">
          <q-input
            v-model.number="patientPercentage"
            class="percentage-input"
            dense
            :max="totalProcessingPercentage"
            min="0"
            outlined
            step="0.01"
            suffix="%"
            type="number"
            @update:model-value="updateFromPatientPercentage"
          />
          <div class="text-grey-6">/ {{ totalProcessingPercentage }}% +</div>
          <div class="text-grey-6">$</div>
          <q-input
            v-model.number="patientFixed"
            class="fixed-input"
            dense
            min="0"
            outlined
            step="0.01"
            type="number"
          />
          <div class="text-grey-6">/ $0.10</div>
        </div>
      </div>

      <!-- Set Patient Fee to 0 Link -->
      <div class="text-center q-mb-lg">
        <q-btn
          color="primary"
          flat
          label="Set patient processing fee to 0"
          @click="setPatientFeeToZero"
        />
      </div>
    </div>

    <!-- Transaction Summary -->
    <div class="transaction-summary q-mb-lg">
      <div class="text-body1 q-mb-sm">
        On this {{ formatCurrency(paymentAmount) }} transaction, you pay
        {{ formatCurrency(calculatedMerchantFee) }}, and patient pays
        {{ formatCurrency(calculatedPatientFee) }}
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="row q-gutter-md">
      <q-btn class="col-6" color="grey-7" flat label="Cancel" @click="$emit('close')" />
      <q-btn class="col-6" color="primary" label="Update" @click="saveConfiguration" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';

import { formatCurrency } from 'src/utils/payment-calculations';

import type { Organization, ProcessingFeeConfig } from 'src/types/payment';

interface Props {
  paymentAmount: number;
  organization: Organization;
  initialConfig?: ProcessingFeeConfig;
}

interface Emits {
  (e: 'save', config: ProcessingFeeConfig): void;
  (e: 'close'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// Get the total processing percentage from organization
const totalProcessingPercentage = computed(
  () => Math.round(parseFloat(props.organization.totalProcessingFeePercentage) * 100 * 100) / 100,
);

// Individual fee components
const merchantPercentage = ref(props.initialConfig?.merchantPercentage ?? 1.0);
const merchantFixed = ref(props.initialConfig?.merchantFixed ?? 0.05);
const patientPercentage = ref(props.initialConfig?.patientPercentage ?? 2.5);
const patientFixed = ref(props.initialConfig?.patientFixed ?? 0.05);

// Slider value (represents merchant percentage)
const sliderValue = ref(merchantPercentage.value);

// Computed values
const merchantFeeAmount = computed(
  () => (sliderValue.value * props.paymentAmount) / 100,
);

const calculatedMerchantFee = computed(
  () => (merchantPercentage.value * props.paymentAmount) / 100 + merchantFixed.value,
);

const calculatedPatientFee = computed(
  () => (patientPercentage.value * props.paymentAmount) / 100 + patientFixed.value,
);

// Tooltip positioning
const tooltipStyle = computed(() => {
  const percentage = sliderValue.value / totalProcessingPercentage.value;
  const leftPosition = percentage * 100;
  return {
    left: `${Math.min(Math.max(leftPosition, 10), 90)}%`,
    transform: 'translateX(-50%)',
  };
});

// Update functions
const updateFromMerchantPercentage = () => {
  sliderValue.value = merchantPercentage.value;
  // Auto-adjust patient percentage to maintain balance
  const remainingPercentage = totalProcessingPercentage.value - merchantPercentage.value;
  if (remainingPercentage >= 0) {
    patientPercentage.value = remainingPercentage;
  }
};

const updateFromPatientPercentage = () => {
  // Auto-adjust merchant percentage to maintain balance
  const remainingPercentage = totalProcessingPercentage.value - patientPercentage.value;
  if (remainingPercentage >= 0) {
    merchantPercentage.value = remainingPercentage;
    sliderValue.value = merchantPercentage.value;
  }
};

const setPatientFeeToZero = () => {
  patientPercentage.value = 0;
  patientFixed.value = 0;
  merchantPercentage.value = totalProcessingPercentage.value;
  sliderValue.value = merchantPercentage.value;
};

const saveConfiguration = () => {
  const config: ProcessingFeeConfig = {
    merchantFixed: merchantFixed.value,
    merchantPercentage: merchantPercentage.value,
    patientFixed: patientFixed.value,
    patientPercentage: patientPercentage.value,
  };
  emit('save', config);
};

// Watch slider changes
watch(sliderValue, (newValue) => {
  merchantPercentage.value = newValue;
  // Auto-adjust patient percentage
  const remainingPercentage = totalProcessingPercentage.value - newValue;
  if (remainingPercentage >= 0) {
    patientPercentage.value = remainingPercentage;
  }
});
</script>

<style scoped>
.edit-processing-fee {
  min-width: 500px;
}

.slider-section {
  position: relative;
  padding-top: 40px;
}

.slider-tooltip {
  position: absolute;
  top: 0;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 8px 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 10;
}

.tooltip-percentage {
  font-weight: 600;
  font-size: 1rem;
  text-align: center;
}

.tooltip-amount {
  font-size: 0.875rem;
  color: #666;
  text-align: center;
}

.fee-slider {
  margin: 20px 0;
}

.slider-labels {
  display: flex;
  justify-content: space-between;
  color: #666;
  font-size: 0.875rem;
}

.fee-row {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.fee-label {
  font-weight: 500;
  font-size: 1rem;
}

.fee-inputs {
  align-items: center;
}

.percentage-input {
  width: 80px;
}

.fixed-input {
  width: 80px;
}

.transaction-summary {
  background: #f5f5f5;
  border-radius: 8px;
  padding: 16px;
  text-align: center;
}
</style>
