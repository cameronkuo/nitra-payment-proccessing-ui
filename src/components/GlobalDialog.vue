<script setup lang="ts" generic="T">
import { onBeforeUnmount, onMounted, ref } from 'vue';

import * as enums from 'src/enums';
import { eventEmitter } from 'src/utils/event-emitter';

import type { DialogConfig } from './GlobalDialog';

const dialogVisible = ref(false);
const configs = ref<DialogConfig | null>(null);

const closeDialog = () => {
  dialogVisible.value = false;
  configs.value?.onClose?.();
  const timeout = setTimeout(() => {
    clearTimeout(timeout);
    configs.value = null;
  }, 200);
};

onMounted(() => {
  eventEmitter.on(enums.emitter.CommonEvent.OPEN_DIALOG, (options) => {
    let threshold = 0;
    if (dialogVisible.value) {
      dialogVisible.value = false;
      threshold = 200;
    }
    const timeout = setTimeout(() => {
      configs.value = options;
      dialogVisible.value = true;
      clearTimeout(timeout);
    }, threshold);
  });

  eventEmitter.on(enums.emitter.CommonEvent.CLOSE_DIALOG, closeDialog);
});

onBeforeUnmount(() => {
  eventEmitter.off(enums.emitter.CommonEvent.OPEN_DIALOG);
  eventEmitter.off(enums.emitter.CommonEvent.CLOSE_DIALOG);
});
</script>

<template>
  <q-dialog :model-value="dialogVisible" v-bind="configs?.dialogProps" @hide="closeDialog">
    <q-card
      :style="{
        width: configs?.dialogProps?.width,
        maxWidth: configs?.dialogProps?.width ? '100%' : undefined,
      }"
    >
      <template v-if="configs?.dialogSlots?.header">
        <component :is="configs.dialogSlots.header" />
      </template>
      <template v-else>
        <q-card-section class="row items-center q-pb-none">
          <div v-if="configs?.title" class="text-h6" v-text="configs?.title" />
          <q-space />
          <q-btn v-if="configs?.showClose ?? true" v-close-popup dense flat icon="close" round />
        </q-card-section>
      </template>
      <template v-if="configs?.children">
        <q-card-section>
          <component :is="configs?.children" />
        </q-card-section>
      </template>
      <template v-if="configs?.dialogSlots?.footer">
        <q-card-actions align="right">
          <component :is="configs.dialogSlots.footer" />
        </q-card-actions>
      </template>
    </q-card>
  </q-dialog>
</template>
