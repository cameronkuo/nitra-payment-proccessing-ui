import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

import locationsData from 'src/mock/locations.json';
import organizationData from 'src/mock/organization.json';
import readersData from 'src/mock/payment-location-readers.json';
import { calculatePaymentTotals } from 'src/utils/payment-calculations';

import type {
  Location,
  Organization,
  PaymentCalculation,
  PaymentData,
  PaymentReader,
  ProcessingFeeConfig,
} from 'src/types/payment';

export const usePaymentStore = defineStore('payment', () => {
  // State
  const selectedLocation = ref<number | null>(null);
  const paymentMethod = ref<'cash' | 'card'>('cash');
  const paymentAmount = ref<number>(0);
  const paymentState = ref<'form' | 'confirmation'>('form');
  const lastPaymentData = ref<PaymentData | null>(null);
  const lastCalculation = ref<PaymentCalculation | null>(null);
  const processingFeeConfig = ref<ProcessingFeeConfig>({
    merchantFixed: 0,
    merchantPercentage: 0,
    patientFixed: 0,
    patientPercentage: 0,
  });

  // Mock data
  const locations = ref<Location[]>(locationsData);
  const organization = ref<Organization>(organizationData);
  const readers = ref<PaymentReader[]>(readersData);

  // Getters
  const currentLocation = computed(
    () => locations.value.find((loc) => loc.id === selectedLocation.value) || null,
  );

  const availableReaders = computed(() =>
    readers.value.filter((reader) => reader.locationId === selectedLocation.value),
  );

  const currentCalculation = computed(() => {
    if (!currentLocation.value || paymentAmount.value <= 0) {
      return null;
    }

    if (paymentMethod.value === 'cash') {
      return calculatePaymentTotals(paymentAmount.value, currentLocation.value);
    } else {
      return calculatePaymentTotals(
        paymentAmount.value,
        currentLocation.value,
        organization.value,
        processingFeeConfig.value,
      );
    }
  });

  const totalProcessingFee = computed(() => {
    if (!organization.value || paymentAmount.value <= 0) return 0;
    return (
      organization.value.totalProcessingFeeFixed +
      (parseFloat(organization.value.totalProcessingFeePercentage) * paymentAmount.value) / 100
    );
  });

  const calculatedMerchantFee = computed(() => {
    if (paymentAmount.value <= 0) return 0;
    return (
      processingFeeConfig.value.merchantFixed +
      (processingFeeConfig.value.merchantPercentage * paymentAmount.value) / 100
    );
  });

  const calculatedPatientFee = computed(() => {
    if (paymentAmount.value <= 0) return 0;
    return (
      processingFeeConfig.value.patientFixed +
      (processingFeeConfig.value.patientPercentage * paymentAmount.value) / 100
    );
  });

  // Actions
  const setLocation = (locationId: number | null) => {
    selectedLocation.value = locationId;
  };

  const setPaymentMethod = (method: 'cash' | 'card') => {
    paymentMethod.value = method;
  };

  const setPaymentAmount = (amount: number) => {
    paymentAmount.value = amount;
  };

  const setProcessingFeeConfig = (config: ProcessingFeeConfig) => {
    processingFeeConfig.value = { ...config };
  };

  const generateTransactionId = (): string => {
    return 'TXN_' + Date.now() + '_' + Math.random().toString(36).substring(2, 11);
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

    const feeConfig = paymentData.processingFeeConfig || processingFeeConfig.value;
    if (!feeConfig) {
      console.error('Processing fee configuration is missing from payment data');
      return;
    }

    const calculation = calculatePaymentTotals(
      paymentData.amount,
      currentLocation.value,
      organization.value,
      feeConfig,
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
    processingFeeConfig.value = {
      merchantFixed: 0,
      merchantPercentage: 0,
      patientFixed: 0,
      patientPercentage: 0,
    };
  };

  const initializeStore = () => {
    // Select first location by default
    if (locations.value.length > 0) {
      selectedLocation.value = locations.value[0]?.id ?? null;
    }

    // Initialize default processing fee configuration
    if (organization.value) {
      processingFeeConfig.value = {
        merchantFixed: organization.value.totalProcessingFeeFixed * 0.5,
        merchantPercentage: parseFloat(organization.value.totalProcessingFeePercentage) * 100 * 0.5,
        patientFixed: organization.value.totalProcessingFeeFixed * 0.5,
        patientPercentage: parseFloat(organization.value.totalProcessingFeePercentage) * 100 * 0.5,
      };
    }
  };

  return {
    // State
    selectedLocation,
    paymentMethod,
    paymentAmount,
    paymentState,
    lastPaymentData,
    lastCalculation,
    processingFeeConfig,
    locations,
    organization,
    readers,

    // Getters
    currentLocation,
    availableReaders,
    currentCalculation,
    totalProcessingFee,
    calculatedMerchantFee,
    calculatedPatientFee,

    // Actions
    setLocation,
    setPaymentMethod,
    setPaymentAmount,
    setProcessingFeeConfig,
    generateTransactionId,
    processCashPayment,
    processCardPayment,
    startNewPayment,
    initializeStore,
  };
});
