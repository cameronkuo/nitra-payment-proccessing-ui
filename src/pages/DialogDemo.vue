<template>
  <q-page padding>
    <h1 class="text-h4 q-mb-md">Global Dialog Demo</h1>
    <div class="q-gutter-md">
      <q-btn color="primary" label="Open Simple Dialog" @click="openSimpleDialog" />
      <q-btn
        color="secondary"
        label="Open Dialog with Custom Header"
        @click="openCustomHeaderDialog"
      />
      <q-btn color="accent" label="Open Dialog with Component" @click="openComponentDialog" />
      <q-btn color="info" label="Open Dialog with Footer" @click="openFooterDialog" />
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { QBar, QBtn, QIcon, QInput, QSpace, useQuasar } from 'quasar';
import { h } from 'vue';

import { CommonEvent } from 'src/enums/emitter';
import { eventEmitter } from 'src/utils/event-emitter';

import type { DialogConfig } from 'src/components/GlobalDialog';

const $q = useQuasar();

const openSimpleDialog = () => {
  const config: DialogConfig = {
    title: 'Simple Dialog',
    showClose: true,
    children: () =>
      h(
        'p',
        'This is the content of the simple dialog. You can close it by clicking the close button, clicking outside, or pressing ESC.',
      ),
    onClose: () => {
      console.log('Simple dialog closed');
    },
  };
  eventEmitter.emit(CommonEvent.OPEN_DIALOG, config);
};

const closeDialog = () => {
  eventEmitter.emit(CommonEvent.CLOSE_DIALOG);
};

const openCustomHeaderDialog = () => {
  const config: DialogConfig = {
    showClose: false,
    dialogSlots: {
      header: () =>
        h(QBar, null, () => [
          h(QIcon, { name: 'network_wifi' }),
          h(QIcon, { name: 'network_cell' }),
          h(QIcon, { name: 'battery_full' }),
          h('div', '9:34'),
          h(QSpace),
          h(QBtn, { icon: 'close', flat: true, round: true, dense: true, onClick: closeDialog }),
        ]),
    },
    children: () =>
      h(
        'p',
        { class: 'q-pt-md' },
        'This dialog has a custom header. The close button in the header is custom.',
      ),
  };
  eventEmitter.emit(CommonEvent.OPEN_DIALOG, config);
};

const MyComponent = {
  setup() {
    return () =>
      h('div', [
        h('p', 'This is a custom component rendered inside the dialog.'),
        h(QInput, {
          modelValue: '',
          label: 'You can interact with it',
          class: 'q-mt-md',
        }),
      ]);
  },
};

const openComponentDialog = () => {
  const config: DialogConfig = {
    title: 'Dialog with Component',
    showClose: true,
    children: () => h(MyComponent),
  };
  eventEmitter.emit(CommonEvent.OPEN_DIALOG, config);
};

const openFooterDialog = () => {
  const config: DialogConfig = {
    title: 'Dialog with Footer',
    showClose: false, // The footer buttons will handle closing
    children: () => h('p', 'This dialog has a custom footer with action buttons.'),
    dialogSlots: {
      footer: () => [
        h(QBtn, {
          label: 'Cancel',
          color: 'primary',
          flat: true,
          onClick: () => {
            closeDialog();
            $q.notify('You clicked Cancel');
          },
        }),
        h(QBtn, {
          label: 'OK',
          color: 'primary',
          onClick: () => {
            closeDialog();
            $q.notify('You clicked OK');
          },
        }),
      ],
    },
  };
  eventEmitter.emit(CommonEvent.OPEN_DIALOG, config);
};
</script>
