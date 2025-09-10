<template>
  <q-page class="flex flex-center">
    <div class="q-pa-lg" style="max-width: 800px; width: 100%">
      <div class="text-h4 q-mb-lg text-center">Breakpoints Demo</div>

      <q-card class="q-mb-lg">
        <q-card-section>
          <div class="text-h6">Current Breakpoints Status</div>
          <div class="text-subtitle2 text-grey">Resize your window to see breakpoints change</div>
        </q-card-section>

        <q-card-section>
          <div class="row q-gutter-md">
            <q-chip
              :color="breakpoints.xs.value ? 'positive' : 'grey-4'"
              size="md"
              :text-color="breakpoints.xs.value ? 'white' : 'grey-8'"
            >
              XS (&lt; 640px): {{ breakpoints.xs.value }}
            </q-chip>

            <q-chip
              :color="breakpoints.sm.value ? 'positive' : 'grey-4'"
              size="md"
              :text-color="breakpoints.sm.value ? 'white' : 'grey-8'"
            >
              SM (≥ 640px): {{ breakpoints.sm.value }}
            </q-chip>

            <q-chip
              :color="breakpoints.md.value ? 'positive' : 'grey-4'"
              size="md"
              :text-color="breakpoints.md.value ? 'white' : 'grey-8'"
            >
              MD (≥ 768px): {{ breakpoints.md.value }}
            </q-chip>

            <q-chip
              :color="breakpoints.lg.value ? 'positive' : 'grey-4'"
              size="md"
              :text-color="breakpoints.lg.value ? 'white' : 'grey-8'"
            >
              LG (≥ 1024px): {{ breakpoints.lg.value }}
            </q-chip>

            <q-chip
              :color="breakpoints.xl.value ? 'positive' : 'grey-4'"
              size="md"
              :text-color="breakpoints.xl.value ? 'white' : 'grey-8'"
            >
              XL (≥ 1280px): {{ breakpoints.xl.value }}
            </q-chip>

            <q-chip
              :color="breakpoints.xxl.value ? 'positive' : 'grey-4'"
              size="md"
              :text-color="breakpoints.xxl.value ? 'white' : 'grey-8'"
            >
              XXL (≥ 1536px): {{ breakpoints.xxl.value }}
            </q-chip>
          </div>
        </q-card-section>
      </q-card>

      <q-card class="q-mb-lg">
        <q-card-section>
          <div class="text-h6">Screen Information</div>
        </q-card-section>

        <q-card-section>
          <div class="row q-gutter-md">
            <div class="col-12 col-sm-6">
              <q-item>
                <q-item-section>
                  <q-item-label>Window Width</q-item-label>
                  <q-item-label caption>{{ windowWidth }}px</q-item-label>
                </q-item-section>
              </q-item>
            </div>

            <div class="col-12 col-sm-6">
              <q-item>
                <q-item-section>
                  <q-item-label>Window Height</q-item-label>
                  <q-item-label caption>{{ windowHeight }}px</q-item-label>
                </q-item-section>
              </q-item>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <q-card class="q-mb-lg">
        <q-card-section>
          <div class="text-h6">Responsive Layout Example</div>
          <div class="text-subtitle2 text-grey">This grid adapts based on current breakpoints</div>
        </q-card-section>

        <q-card-section>
          <div class="row q-gutter-md">
            <div
              v-for="i in 4"
              :key="i"
              :class="[
                'col-12',
                breakpoints.sm.value ? 'col-sm-6' : '',
                breakpoints.md.value ? 'col-md-4' : '',
                breakpoints.lg.value ? 'col-lg-3' : '',
              ]"
            >
              <q-card class="bg-blue-1">
                <q-card-section>
                  <div class="text-center">Card {{ i }}</div>
                  <div class="text-caption text-center text-grey">
                    <div v-if="breakpoints.xs.value">Full width (XS)</div>
                    <div v-else-if="breakpoints.sm.value && !breakpoints.md.value">
                      Half width (SM)
                    </div>
                    <div v-else-if="breakpoints.md.value && !breakpoints.lg.value">
                      1/3 width (MD)
                    </div>
                    <div v-else-if="breakpoints.lg.value">1/4 width (LG+)</div>
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <q-card>
        <q-card-section>
          <div class="text-h6">Usage Instructions</div>
        </q-card-section>

        <q-card-section>
          <div class="text-body2">
            <p><strong>How to use the useBreakpoints composable:</strong></p>
            <pre class="bg-grey-2 q-pa-md">
import useBreakpoints from 'src/composables/useBreakpoints';

const breakpoints = useBreakpoints();

// Check if screen is extra small
if (breakpoints.xs.value) {
  // Mobile layout
}

// Check if screen is large or bigger
if (breakpoints.lg.value) {
  // Desktop layout
}</pre
            >

            <p class="q-mt-md"><strong>Available breakpoints:</strong></p>
            <ul>
              <li><code>xs</code>: smaller than 640px (mobile)</li>
              <li><code>sm</code>: 640px and up (small tablet)</li>
              <li><code>md</code>: 768px and up (tablet)</li>
              <li><code>lg</code>: 1024px and up (small desktop)</li>
              <li><code>xl</code>: 1280px and up (desktop)</li>
              <li><code>xxl</code>: 1536px and up (large desktop)</li>
            </ul>

            <p class="q-mt-md">
              Notice how the sidebar in the MainLayout automatically opens/closes based on the XXL
              breakpoint (≥1536px).
            </p>
          </div>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';

import useBreakpoints from 'src/composables/useBreakpoints';

const breakpoints = useBreakpoints();

const windowWidth = ref(0);
const windowHeight = ref(0);

function updateWindowSize() {
  windowWidth.value = window.innerWidth;
  windowHeight.value = window.innerHeight;
}

onMounted(() => {
  updateWindowSize();
  window.addEventListener('resize', updateWindowSize);
});

onUnmounted(() => {
  window.removeEventListener('resize', updateWindowSize);
});
</script>
