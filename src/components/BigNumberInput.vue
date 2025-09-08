<script setup lang="ts">
import numeral from 'numeral';
import { computed, ref } from 'vue';

defineModel<string | number | null>('modelValue');

const props = defineProps<{
  step?: number;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: number | null): void;
}>();

const computedStep = computed(() => props.step ?? 1);

const contentEditable = ref<HTMLElement | null>(null);

const onIncreaseOrDecrease = (event: Event, val: number) => {
  const target = event.target as HTMLElement;
  const value = numeral(target.innerText).value() || 0;
  emit('update:modelValue', value + val);
};

const onInput = (event: Event) => {
  const target = event.target as HTMLElement;
  const value = numeral(target.innerText).value();
  emit('update:modelValue', value);
};

const triggerBlur = () => {
  contentEditable.value?.blur();
};
</script>

<template>
  <span
    ref="contentEditable"
    contenteditable
    @blur="onInput"
    @keydown.down.prevent="(e) => onIncreaseOrDecrease(e, -computedStep)"
    @keydown.enter.prevent="triggerBlur"
    @keydown.esc.prevent="triggerBlur"
    @keydown.up.prevent="(e) => onIncreaseOrDecrease(e, computedStep)"
    v-text="numeral(modelValue).format('0,0.00')"
  />
</template>
