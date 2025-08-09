<template>
  <q-page padding>
    <h1 class="text-h4 q-mb-md">SVG Icons</h1>
    <p class="text-body1 q-mb-lg">
      List of all SVG icons available in the project from
      <code>@src/components/SVGIcons.tsx</code>. Click to copy the component tag.
    </p>
    <div class="q-gutter-md row items-start">
      <div
        v-for="icon in icons"
        :key="icon.name"
        class="text-center q-pa-md rounded-borders cursor-pointer"
        style="width: 150px"
        @click="copyIcon(icon.name)"
      >
        <div
          class="row items-center justify-center q-pa-md rounded-borders"
          style="background-color: #f5f5f5; height: 100px"
        >
          <component :is="icon.component" :height="48" :width="48" />
        </div>
        <div class="text-caption q-mt-sm text-grey-8">{{ icon.name }}</div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useQuasar, copyToClipboard } from 'quasar';
import * as SVGIcons from 'src/components/SVGIcons';

const $q = useQuasar();

const icons = computed(() => {
  return Object.keys(SVGIcons).map((name) => {
    return {
      name: name,
      component: SVGIcons[name as keyof typeof SVGIcons],
    };
  });
});

function copyIcon(name: string) {
  const code = `<${name} size={24} />`;
  copyToClipboard(code)
    .then(() => {
      $q.notify({
        message: `Copied "${name}" to clipboard`,
        color: 'positive',
        icon: 'check',
        position: 'top',
        timeout: 2000,
      });
    })
    .catch(() => {
      $q.notify({
        message: 'Failed to copy to clipboard',
        color: 'negative',
        icon: 'warning',
        position: 'top',
        timeout: 2000,
      });
    });
}
</script>
