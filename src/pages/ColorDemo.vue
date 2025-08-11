<template>
  <q-page class="q-pa-md">
    <div class="text-h4 q-mb-lg">Color Palette Demo</div>

    <div v-for="(colorGroup, colorName) in colors" :key="colorName" class="q-mb-xl">
      <div class="text-h5 q-mb-md text-capitalize">{{ colorName }}</div>
      <div class="row q-gutter-md">
        <div
          v-for="(hex, shade) in colorGroup"
          :key="shade"
          class="color-swatch"
          :style="{ backgroundColor: hex }"
          :title="`Click to copy ${hex}`"
          @click="copyToClipboard(hex)"
        >
          <div class="color-info">
            <div class="text-weight-bold">{{ shade }}</div>
            <div class="text-caption">{{ hex }}</div>
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar';
import { ref } from 'vue';

interface ColorShades {
  [shade: string]: string;
}

interface Colors {
  [colorName: string]: ColorShades;
}

const $q = useQuasar();

const colors = ref<Colors>({
  gray: {
    '0': '#f4f5f6',
    '50': '#ebeeef',
    '100': '#e3e6e8',
    '200': '#d5dadc',
    '300': '#c6cdd0',
    '400': '#abb5ba',
    '500': '#8f9ca3',
    '600': '#73838c',
    '700': '#5c6970',
    '800': '#454f54',
    '900': '#2e3538',
  },
  teal: {
    '0': '#eef6f7',
    '50': '#cbe5e6',
    '100': '#a9d4d6',
    '200': '#86c2c5',
    '300': '#64b1b5',
    '400': '#4a979b',
    '500': '#3a7679',
    '600': '#2e5e60',
    '700': '#264d4f',
    '800': '#1e3c3e',
    '900': '#162b2d',
  },
  green: {
    '0': '#eafbf4',
    '50': '#ccf5e4',
    '100': '#a1edcd',
    '200': '#76e5b6',
    '300': '#4ddda0',
    '400': '#1cd084',
    '500': '#15b471',
    '600': '#11925c',
    '700': '#0d7248',
    '800': '#095234',
    '900': '#063723',
  },
  yellow: {
    '0': '#fffef5',
    '50': '#fffce5',
    '100': '#fff9cc',
    '200': '#fff6b3',
    '300': '#fff18a',
    '400': '#ffe624',
    '500': '#fadd00',
    '600': '#dec60c',
    '700': '#b8a40a',
    '800': '#918108',
    '900': '#6a5f06',
  },
  amber: {
    '0': '#fdf7ed',
    '50': '#fbeeda',
    '100': '#f9e5c7',
    '200': '#f6d4a2',
    '300': '#f1bf74',
    '400': '#ecaa46',
    '500': '#e89519',
    '600': '#c27d14',
    '700': '#9d6510',
    '800': '#7d500d',
    '900': '#583809',
  },
  orange: {
    '0': '#fff2eb',
    '50': '#fee5d7',
    '100': '#fed5be',
    '200': '#fdb48c',
    '300': '#fc945a',
    '400': '#fb7429',
    '500': '#eb5704',
    '600': '#c94a03',
    '700': '#a13b02',
    '800': '#792c02',
    '900': '#501d01',
  },
  red: {
    '0': '#fdf1f1',
    '50': '#fce4e4',
    '100': '#f6b7b7',
    '200': '#f08a8a',
    '300': '#ea5d5d',
    '400': '#e43030',
    '500': '#c71a1a',
    '600': '#991414',
    '700': '#831111',
    '800': '#6c0e0e',
    '900': '#480909',
  },
});

const copyToClipboard = async (hex: string) => {
  try {
    await navigator.clipboard.writeText(hex);
    $q.notify({
      message: `Copied ${hex} to clipboard`,
      color: 'positive',
      position: 'top',
      timeout: 1500,
      icon: 'fa-solid fa-check',
    });
  } catch {
    $q.notify({
      message: 'Failed to copy to clipboard',
      color: 'negative',
      position: 'top',
      timeout: 2000,
      icon: 'fa-solid fa-times',
    });
  }
};
</script>

<style scoped>
.color-swatch {
  width: 120px;
  height: 80px;
  border-radius: 8px;
  display: flex;
  align-items: flex-end;
  position: relative;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.2s ease;
}

.color-swatch:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.color-info {
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 8px;
  width: 100%;
  border-radius: 0 0 8px 8px;
  text-align: center;
}

.text-caption {
  font-size: 10px;
  opacity: 0.9;
}
</style>
