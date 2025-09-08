<script setup lang="ts">
import numeral from 'numeral';
import { ref } from 'vue';

defineModel<string | number | null>('modelValue');

const contentEditable = ref<HTMLElement | null>(null);

const emit = defineEmits<{
  (e: 'update:modelValue', value: number | null): void;
}>();

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
    @keydown.enter.prevent="triggerBlur"
    @keydown.esc.prevent="triggerBlur"
    v-text="numeral(modelValue).format('0,0.00')"
  />
</template>
