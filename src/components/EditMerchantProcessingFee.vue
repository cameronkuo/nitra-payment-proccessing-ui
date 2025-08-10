<template>
  <div class="edit-processing-fee q-pa-md">
    <div class="text-h6 q-mb-md">Edit Merchant Processing Fee</div>
    
    <!-- Payment Amount Display -->
    <div class="q-mb-md">
      <q-input
        filled
        label="Payment Amount"
        :model-value="formatCurrency(paymentAmount)"
        readonly
      />
    </div>

    <!-- Total Processing Fee Display -->
    <div class="q-mb-md">
      <q-card bordered class="q-pa-md" flat>
        <div class="text-subtitle2 q-mb-sm">Total Processing Fee</div>
        <div class="row q-gutter-md">
          <div class="col">
            <q-input
              dense
              filled
              label="Fixed Fee ($)"
              :model-value="organization.totalProcessingFeeFixed"
              readonly
              type="number"
            />
          </div>
          <div class="col">
            <q-input
              dense
              filled
              label="Percentage (%)"
              :model-value="(parseFloat(organization.totalProcessingFeePercentage) * 100).toFixed(2)"
              readonly
              type="number"
            />
          </div>
        </div>
        <div class="text-body2 text-primary q-mt-sm">
          Total: {{ formatCurrency(totalProcessingFee) }}
        </div>
      </q-card>
    </div>

    <!-- Fee Distribution -->
    <div class="q-mb-md">
      <div class="text-subtitle1 q-mb-md">Fee Distribution</div>
      
      <!-- Merchant Fees -->
      <q-card bordered class="q-pa-md q-mb-md" flat>
        <div class="text-subtitle2 q-mb-sm">Merchant Fees</div>
        <div class="row q-gutter-md">
          <div class="col">
            <q-input
              v-model.number="feeConfig.merchantFixed"
              dense
              filled
              label="Fixed Fee ($)"
              min="0"
              step="0.01"
              type="number"
              @update:model-value="onFeeConfigChange"
            />
          </div>
          <div class="col">
            <q-input
              v-model.number="feeConfig.merchantPercentage"
              dense
              filled
              label="Percentage (%)"
              min="0"
              step="0.01"
              type="number"
              @update:model-value="onFeeConfigChange"
            />
          </div>
        </div>
        <div class="text-body2 text-negative q-mt-sm">
          Merchant pays: {{ formatCurrency(calculatedMerchantFee) }}
        </div>
      </q-card>

      <!-- Patient Fees -->
      <q-card bordered class="q-pa-md" flat>
        <div class="text-subtitle2 q-mb-sm">Patient Fees</div>
        <div class="row q-gutter-md">
          <div class="col">
            <q-input
              v-model.number="feeConfig.patientFixed"
              dense
              filled
              label="Fixed Fee ($)"
              min="0"
              step="0.01"
              type="number"
              @update:model-value="onFeeConfigChange"
            />
          </div>
          <div class="col">
            <q-input
              v-model.number="feeConfig.patientPercentage"
              dense
              filled
              label="Percentage (%)"
              min="0"
              step="0.01"
              type="number"
              @update:model-value="onFeeConfigChange"
            />
          </div>
        </div>
        <div class="text-body2 text-negative q-mt-sm">
          Patient pays: {{ formatCurrency(calculatedPatientFee) }}
        </div>
      </q-card>
    </div>

    <!-- Fee Validation -->
    <div v-if="feeValidationMessage" class="q-mb-md">
      <q-banner :class="feeValidationClass">
        {{ feeValidationMessage }}
      </q-banner>
    </div>

    <!-- Action Buttons -->
    <div class="row q-gutter-md">
      <q-btn
        color="grey-7"
        flat
        label="Cancel"
        @click="$emit('close')"
      />
      <q-btn
        color="primary"
        :disabled="!isValidConfiguration"
        label="Save Configuration"
        @click="saveConfiguration"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, watch } from 'vue';

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

const feeConfig = reactive<ProcessingFeeConfig>({
  merchantFixed: props.initialConfig?.merchantFixed ?? 0,
  merchantPercentage: props.initialConfig?.merchantPercentage ?? 0,
  patientFixed: props.initialConfig?.patientFixed ?? 0,
  patientPercentage: props.initialConfig?.patientPercentage ?? 0,
});

const totalProcessingFee = computed(() => {
  const fixedFee = props.organization.totalProcessingFeeFixed;
  const percentageFee = parseFloat(props.organization.totalProcessingFeePercentage) * props.paymentAmount;
  return fixedFee + percentageFee;
});

const calculatedMerchantFee = computed(() => 
  feeConfig.merchantFixed + (feeConfig.merchantPercentage * props.paymentAmount / 100)
);

const calculatedPatientFee = computed(() => 
  feeConfig.patientFixed + (feeConfig.patientPercentage * props.paymentAmount / 100)
);

const totalConfiguredFees = computed(() => 
  calculatedMerchantFee.value + calculatedPatientFee.value
);

const isValidConfiguration = computed(() => {
  const difference = Math.abs(totalConfiguredFees.value - totalProcessingFee.value);
  return difference < 0.01; // Allow for small rounding differences
});

const feeValidationMessage = computed(() => {
  const difference = totalConfiguredFees.value - totalProcessingFee.value;
  
  if (Math.abs(difference) < 0.01) {
    return 'Fee distribution is correct.';
  } else if (difference > 0.01) {
    return `Warning: Configured fees exceed total processing fee by ${formatCurrency(difference)}.`;
  } else {
    return `Warning: Configured fees are ${formatCurrency(Math.abs(difference))} less than total processing fee.`;
  }
});

const feeValidationClass = computed(() => {
  if (isValidConfiguration.value) {
    return 'text-positive bg-green-1';
  }
  return 'text-warning bg-orange-1';
});

const onFeeConfigChange = () => {
  // Force reactivity update
};

const saveConfiguration = () => {
  if (isValidConfiguration.value) {
    emit('save', { ...feeConfig });
  }
};

// Auto-adjust patient fees to balance the total when merchant fees change
watch([() => feeConfig.merchantFixed, () => feeConfig.merchantPercentage], () => {
  const remainingFee = totalProcessingFee.value - calculatedMerchantFee.value;
  if (remainingFee >= 0) {
    // Try to distribute remaining fee proportionally
    const currentPatientTotal = calculatedPatientFee.value;
    if (currentPatientTotal > 0) {
      const ratio = remainingFee / currentPatientTotal;
      feeConfig.patientFixed *= ratio;
      feeConfig.patientPercentage *= ratio;
    } else {
      // If patient has no fees, set a reasonable split
      feeConfig.patientFixed = remainingFee * 0.5;
      feeConfig.patientPercentage = (remainingFee * 0.5) / props.paymentAmount * 100;
    }
  }
});
</script>

<style scoped>
.edit-processing-fee {
  min-width: 500px;
}
</style>